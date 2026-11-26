package com.semo.semoserver.review.service;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.global.storage.FileStorage;
import com.semo.semoserver.moment.dto.MomentCount;
import com.semo.semoserver.moment.dto.MomentListItem;
import com.semo.semoserver.moment.entity.Moment;
import com.semo.semoserver.moment.repository.MomentQueryRepository;
import com.semo.semoserver.moment.service.MomentRecalculator;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.participant.service.SemoAccessChecker;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.entity.PhotoMatchStatus;
import com.semo.semoserver.photo.repository.PhotoQueryRepository;
import com.semo.semoserver.review.dto.AssignRequest;
import com.semo.semoserver.review.dto.AssignResponse;
import com.semo.semoserver.review.dto.ReviewPhotoItem;
import com.semo.semoserver.review.repository.ReviewPhotoRepository;
import com.semo.semoserver.semo.repository.SemoRepository;
import com.semo.semoserver.upload.service.MatchRules;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhotoReviewService {

    private static final List<PhotoMatchStatus> REVIEW_STATUSES =
            List.of(PhotoMatchStatus.NEEDS_REVIEW, PhotoMatchStatus.UNCLASSIFIED);

    private final SemoRepository semoRepository;
    private final SemoAccessChecker accessChecker;
    private final ReviewPhotoRepository reviewPhotoRepository;
    private final PhotoQueryRepository photoQueryRepository;
    private final MomentQueryRepository momentRepository;
    private final MomentRecalculator momentRecalculator;
    private final FileStorage fileStorage;

    // 확인이 필요한 사진 목록 + 사진마다 후보 Moment
    public List<ReviewPhotoItem> getReviewPhotos(Long guestId, Long semoId) {
        if (!semoRepository.existsById(semoId)) {
            throw new CustomException(ErrorCode.SEMO_NOT_FOUND);
        }
        Participant me = accessChecker.getMyParticipant(semoId, guestId);

        List<Photo> photos = reviewPhotoRepository.findMyReviewPhotos(semoId, me.getId(), REVIEW_STATUSES);
        List<Moment> moments = momentRepository.findAllBySemoId(semoId);
        Map<Long, Long> participantCounts = photoQueryRepository.countParticipantsByMoment(semoId).stream()
                .collect(Collectors.toMap(MomentCount::momentId, MomentCount::count));

        return photos.stream()
                .map(p -> new ReviewPhotoItem(
                        p.getId(),
                        fileStorage.getUrl(p.getStorageKey()),
                        p.getTakenAt(),
                        candidates(p, moments, participantCounts)))
                .toList();
    }

    // 사진을 Moment에 넣기 (기존 Moment 또는 새 Moment)
    @Transactional
    public AssignResponse assign(Long guestId, Long photoId, AssignRequest request) {
        Photo photo = photoQueryRepository.findDetailById(photoId)
                .orElseThrow(() -> new CustomException(ErrorCode.PHOTO_NOT_FOUND));
        Long semoId = photo.getSemo().getId();
        Participant me = accessChecker.getMyParticipant(semoId, guestId);
        if (!photo.getParticipant().getId().equals(me.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        boolean wantsNew = Boolean.TRUE.equals(request.newMoment());
        if (wantsNew == (request.momentId() != null)) {
            throw new CustomException(ErrorCode.INVALID_INPUT); // 둘 중 하나만
        }

        Moment from = photo.getMoment();
        Long fromId = from == null ? null : from.getId();

        Moment target;
        if (wantsNew) {
            LocalDateTime t = photo.getTakenAt() != null ? photo.getTakenAt()
                    : (photo.getCreatedAt() != null ? photo.getCreatedAt() : LocalDateTime.now());
            int number = momentRepository.findAllBySemoId(semoId).size() + 1;
            target = momentRepository.save(Moment.create(photo.getSemo(), "Moment " + number, t, t, 0));
        } else {
            target = momentRepository.findById(request.momentId())
                    .filter(m -> m.getSemo().getId().equals(semoId))
                    .orElseThrow(() -> new CustomException(ErrorCode.MOMENT_NOT_FOUND));
        }

        if (from != null && from.getRepresentativePhoto() != null
                && from.getRepresentativePhoto().getId().equals(photo.getId())) {
            from.changeRepresentativePhoto(null);
        }
        photo.changeMoment(target);
        photoQueryRepository.flush();

        if (fromId != null && !fromId.equals(target.getId())) {
            momentRecalculator.recalculate(fromId);
        }
        momentRecalculator.recalculate(target.getId());

        long remaining = reviewPhotoRepository.countBySemo_IdAndParticipant_IdAndMatchStatusIn(
                semoId, me.getId(), REVIEW_STATUSES);
        return new AssignResponse(target.getId(), remaining);
    }

    // 촬영 시각이 있으면 10분 이내 Moment를 가까운 순으로, 없으면 전체 Moment
    private List<MomentListItem> candidates(Photo photo, List<Moment> moments, Map<Long, Long> counts) {
        LocalDateTime t = photo.getTakenAt();
        if (t == null) {
            return moments.stream().map(m -> toItem(m, counts)).toList();
        }
        return moments.stream()
                .filter(m -> MatchRules.withinTime(m.getStartAt(), m.getEndAt(), t))
                .sorted(Comparator.comparingLong(m -> MatchRules.gapSeconds(m.getStartAt(), m.getEndAt(), t)))
                .map(m -> toItem(m, counts))
                .toList();
    }

    private MomentListItem toItem(Moment m, Map<Long, Long> counts) {
        return new MomentListItem(
                m.getId(),
                m.getName(),
                m.getStartAt(),
                m.getPhotoCount(),
                counts.getOrDefault(m.getId(), 0L),
                m.getRepresentativePhoto() == null ? null
                        : fileStorage.getUrl(m.getRepresentativePhoto().getStorageKey()));
    }
}
