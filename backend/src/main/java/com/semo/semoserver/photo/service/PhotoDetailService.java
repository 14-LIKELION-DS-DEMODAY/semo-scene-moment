package com.semo.semoserver.photo.service;

import com.semo.semoserver.comment.entity.Comment;
import com.semo.semoserver.comment.repository.CommentRepository;
import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.global.storage.FileStorage;
import com.semo.semoserver.like.repository.PhotoLikeRepository;
import com.semo.semoserver.moment.entity.Moment;
import com.semo.semoserver.moment.repository.MomentQueryRepository;
import com.semo.semoserver.moment.service.MomentRecalculator;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.participant.service.SemoAccessChecker;
import com.semo.semoserver.photo.dto.PhotoDeleteResponse;
import com.semo.semoserver.photo.dto.PhotoDetailResponse;
import com.semo.semoserver.photo.dto.PhotoMoveResponse;
import com.semo.semoserver.photo.dto.RecentComment;
import com.semo.semoserver.photo.dto.UploaderSummary;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.repository.PhotoQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhotoDetailService {

    private static final int RECENT_COMMENT_SIZE = 2;

    private final PhotoQueryRepository photoRepository;
    private final MomentQueryRepository momentRepository;
    private final PhotoLikeRepository photoLikeRepository;
    private final CommentRepository commentRepository;
    private final SemoAccessChecker accessChecker;
    private final FileStorage fileStorage;
    private final MomentRecalculator momentRecalculator; // Moment 재계산 함수

    // 사진 보기
    public PhotoDetailResponse getPhoto(Long guestId, Long photoId, Long filterParticipantId) {
        Photo photo = getPhotoOrThrow(photoId);
        Participant me = accessChecker.getMyParticipant(photo.getSemo().getId(), guestId);
        Participant uploader = photo.getParticipant();

        Long[] prevNext = findPrevNext(photo, filterParticipantId);
        String url = fileStorage.getUrl(photo.getStorageKey());

        return new PhotoDetailResponse(
                photo.getId(),
                photo.getMoment() == null ? null : photo.getMoment().getId(),
                url,
                url,
                photo.getWidth(),
                photo.getHeight(),
                photo.getTakenAt(),
                new UploaderSummary(uploader.getId(), uploader.getNickname()),
                uploader.getId().equals(me.getId()),
                photoLikeRepository.countByPhoto_Id(photoId),
                photoLikeRepository.existsByPhoto_IdAndParticipant_Id(photoId, me.getId()),
                commentRepository.countByPhoto_Id(photoId),
                recentComments(photoId),
                prevNext[0],
                prevNext[1]);
    }

    // 사진 삭제
    @Transactional
    public PhotoDeleteResponse delete(Long guestId, Long photoId) {
        Photo photo = getPhotoOrThrow(photoId);
        Participant me = accessChecker.getMyParticipant(photo.getSemo().getId(), guestId);
        if (!photo.getParticipant().getId().equals(me.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        Moment moment = photo.getMoment();
        Long momentId = moment == null ? null : moment.getId();

        // 사진 가리키는 행 정리
        photoLikeRepository.deleteAllByPhotoId(photoId);
        commentRepository.deleteAllByPhotoId(photoId);
        clearRepresentativeIfSame(moment, photo);

        // 사진 삭제
        String storageKey = photo.getStorageKey();
        photoRepository.delete(photo);
        photoRepository.flush();
        deleteFileAfterCommit(storageKey);

        // Moment 재계산
        boolean momentDeleted = false;
        if (momentId != null) {
            momentRecalculator.recalculate(momentId);
            momentDeleted = !momentRepository.existsById(momentId);
        }
        return new PhotoDeleteResponse(momentDeleted);
    }

    // 다른 Moment로 이동
    @Transactional
    public PhotoMoveResponse move(Long guestId, Long photoId, Long targetMomentId) {
        Photo photo = getPhotoOrThrow(photoId);
        accessChecker.getMyParticipant(photo.getSemo().getId(), guestId);

        Moment target = momentRepository.findById(targetMomentId)
                .filter(m -> m.getSemo().getId().equals(photo.getSemo().getId()))
                .orElseThrow(() -> new CustomException(ErrorCode.MOMENT_NOT_FOUND));

        Moment from = photo.getMoment();
        if (from != null && from.getId().equals(target.getId())) {
            return new PhotoMoveResponse(false);
        }
        Long fromId = from == null ? null : from.getId();

        clearRepresentativeIfSame(from, photo);
        photo.changeMoment(target);
        photoRepository.flush();

        // Moment 모두 재계산
        if (fromId != null) {
            momentRecalculator.recalculate(fromId);
        }
        momentRecalculator.recalculate(target.getId());

        boolean fromDeleted = fromId != null && !momentRepository.existsById(fromId);
        return new PhotoMoveResponse(fromDeleted);
    }

    // 이전/다음 사진
    private Long[] findPrevNext(Photo photo, Long filterParticipantId) {
        if (photo.getMoment() == null) {
            return new Long[]{null, null};
        }
        List<Long> ids = photoRepository.findMomentPhotos(photo.getMoment().getId()).stream()
                .filter(p -> filterParticipantId == null || p.getParticipant().getId().equals(filterParticipantId))
                .map(Photo::getId)
                .toList();
        int index = ids.indexOf(photo.getId());
        if (index < 0) {
            return filterParticipantId == null ? new Long[]{null, null} : findPrevNext(photo, null);
        }
        int size = ids.size();
        return new Long[]{ids.get((index - 1 + size) % size), ids.get((index + 1) % size)};
    }

    // 최신 2개를 시간순 배열
    private List<RecentComment> recentComments(Long photoId) {
        List<Comment> latest = commentRepository.findLatestByPhotoId(photoId, PageRequest.of(0, RECENT_COMMENT_SIZE));
        List<RecentComment> result = new ArrayList<>(latest.stream()
                .map(c -> new RecentComment(c.getId(), c.getParticipant().getNickname(), c.getContent(), c.getCreatedAt()))
                .toList());
        Collections.reverse(result);
        return result;
    }

    // Moment의 대표 사진일 경우
    private void clearRepresentativeIfSame(Moment moment, Photo photo) {
        if (moment != null && moment.getRepresentativePhoto() != null
                && moment.getRepresentativePhoto().getId().equals(photo.getId())) {
            moment.changeRepresentativePhoto(null);
        }
    }

    private void deleteFileAfterCommit(String storageKey) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            fileStorage.delete(storageKey);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                fileStorage.delete(storageKey);
            }
        });
    }

    private Photo getPhotoOrThrow(Long photoId) {
        return photoRepository.findDetailById(photoId)
                .orElseThrow(() -> new CustomException(ErrorCode.PHOTO_NOT_FOUND));
    }
}
