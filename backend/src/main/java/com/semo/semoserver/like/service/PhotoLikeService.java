package com.semo.semoserver.like.service;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.like.dto.LikeResponse;
import com.semo.semoserver.like.entity.PhotoLike;
import com.semo.semoserver.like.repository.PhotoLikeRepository;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.participant.service.SemoAccessChecker;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.repository.PhotoQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PhotoLikeService {

    private final PhotoLikeRepository photoLikeRepository;
    private final PhotoQueryRepository photoRepository;
    private final SemoAccessChecker accessChecker;

    // 같은 사람이 두 번 눌러도 한 번만 반영
    @Transactional
    public LikeResponse like(Long guestId, Long photoId) {
        Photo photo = getPhoto(photoId);
        Participant me = accessChecker.getMyParticipant(photo.getSemo().getId(), guestId);
        if (!photoLikeRepository.existsByPhoto_IdAndParticipant_Id(photoId, me.getId())) {
            photoLikeRepository.saveAndFlush(PhotoLike.create(photo, me));
        }
        return new LikeResponse(true, photoLikeRepository.countByPhoto_Id(photoId));
    }

    @Transactional
    public LikeResponse unlike(Long guestId, Long photoId) {
        Photo photo = getPhoto(photoId);
        Participant me = accessChecker.getMyParticipant(photo.getSemo().getId(), guestId);
        photoLikeRepository.deleteByPhotoAndParticipant(photoId, me.getId());
        return new LikeResponse(false, photoLikeRepository.countByPhoto_Id(photoId));
    }

    // 동시에 두 번 눌러 유니크 제약에 걸렸을 때 현재 상태를 돌려주기 위함
    public LikeResponse getState(Long guestId, Long photoId) {
        Photo photo = getPhoto(photoId);
        Participant me = accessChecker.getMyParticipant(photo.getSemo().getId(), guestId);
        return new LikeResponse(
                photoLikeRepository.existsByPhoto_IdAndParticipant_Id(photoId, me.getId()),
                photoLikeRepository.countByPhoto_Id(photoId));
    }

    private Photo getPhoto(Long photoId) {
        return photoRepository.findDetailById(photoId)
                .orElseThrow(() -> new CustomException(ErrorCode.PHOTO_NOT_FOUND));
    }
}
