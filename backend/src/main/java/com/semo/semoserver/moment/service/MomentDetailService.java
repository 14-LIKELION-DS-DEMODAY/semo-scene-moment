package com.semo.semoserver.moment.service;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.global.storage.FileStorage;
import com.semo.semoserver.moment.dto.MomentCount;
import com.semo.semoserver.moment.dto.MomentDetailResponse;
import com.semo.semoserver.moment.dto.MomentListItem;
import com.semo.semoserver.moment.dto.MomentNameResponse;
import com.semo.semoserver.moment.dto.MomentPhotoItem;
import com.semo.semoserver.moment.dto.MomentPhotoKey;
import com.semo.semoserver.moment.dto.PhotographerSummary;
import com.semo.semoserver.moment.entity.Moment;
import com.semo.semoserver.moment.repository.MomentQueryRepository;
import com.semo.semoserver.participant.service.SemoAccessChecker;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.repository.PhotoQueryRepository;
import com.semo.semoserver.semo.repository.SemoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MomentDetailService {

    private final MomentQueryRepository momentRepository;
    private final PhotoQueryRepository photoRepository;
    private final SemoRepository semoRepository;
    private final SemoAccessChecker accessChecker;
    private final FileStorage fileStorage;

    // Moment 보기
    public MomentDetailResponse getMoment(Long guestId, Long momentId, Long participantId) {
        Moment moment = getMomentOrThrow(momentId);
        accessChecker.getMyParticipant(moment.getSemo().getId(), guestId);

        List<Photo> allPhotos = photoRepository.findMomentPhotos(momentId);
        List<MomentPhotoItem> photos = allPhotos.stream()
                .filter(p -> participantId == null || p.getParticipant().getId().equals(participantId))
                .map(p -> new MomentPhotoItem(
                        p.getId(),
                        fileStorage.getUrl(p.getStorageKey()),
                        p.getParticipant().getId(),
                        p.getParticipant().getNickname(),
                        p.getTakenAt()))
                .toList();
        List<PhotographerSummary> photographers = photoRepository.findPhotographers(momentId);

        return new MomentDetailResponse(
                moment.getId(),
                moment.getName(),
                moment.getStartAt(),
                moment.getEndAt(),
                allPhotos.size(),
                representativeUrl(moment, allPhotos.isEmpty() ? null : allPhotos.get(0).getStorageKey()),
                photographers,
                photos);
    }

    // Moment 이름 변경
    @Transactional
    public MomentNameResponse rename(Long guestId, Long momentId, String name) {
        Moment moment = getMomentOrThrow(momentId);
        accessChecker.getMyParticipant(moment.getSemo().getId(), guestId);
        moment.changeName(name.strip());
        return new MomentNameResponse(moment.getId(), moment.getName());
    }

    // 다른 Moment로 이동
    public List<MomentListItem> getMoments(Long guestId, Long semoId, Long excludeMomentId) {
        if (!semoRepository.existsById(semoId)) {
            throw new CustomException(ErrorCode.SEMO_NOT_FOUND);
        }
        accessChecker.getMyParticipant(semoId, guestId);

        Map<Long, Long> participantCounts = photoRepository.countParticipantsByMoment(semoId).stream()
                .collect(Collectors.toMap(MomentCount::momentId, MomentCount::count));
        // Moment별 첫 사진 키
        Map<Long, String> firstPhotoKeys = new HashMap<>();
        for (MomentPhotoKey key : photoRepository.findPhotoKeysBySemo(semoId)) {
            firstPhotoKeys.putIfAbsent(key.momentId(), key.storageKey());
        }

        return momentRepository.findAllBySemoId(semoId).stream()
                .filter(m -> !Objects.equals(m.getId(), excludeMomentId))
                .map(m -> new MomentListItem(
                        m.getId(),
                        m.getName(),
                        m.getStartAt(),
                        m.getPhotoCount(),
                        participantCounts.getOrDefault(m.getId(), 0L),
                        representativeUrl(m, firstPhotoKeys.get(m.getId()))))
                .toList();
    }

    // 대표 사진, 없으면 가장 먼저 찍은 사진
    private String representativeUrl(Moment moment, String fallbackKey) {
        Photo representative = moment.getRepresentativePhoto();
        String key = representative != null ? representative.getStorageKey() : fallbackKey;
        return fileStorage.getUrl(key);
    }

    private Moment getMomentOrThrow(Long momentId) {
        return momentRepository.findDetailById(momentId)
                .orElseThrow(() -> new CustomException(ErrorCode.MOMENT_NOT_FOUND));
    }
}
