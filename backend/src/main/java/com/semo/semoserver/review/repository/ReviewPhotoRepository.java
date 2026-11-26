package com.semo.semoserver.review.repository;

import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.entity.PhotoMatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ReviewPhotoRepository extends JpaRepository<Photo, Long> {

    // 이 세모에서 내가 올린 사진 중 확인이 필요한 사진
    @Query("select p from Photo p where p.semo.id = :semoId and p.participant.id = :participantId "
            + "and p.matchStatus in :statuses order by p.takenAt asc, p.id asc")
    List<Photo> findMyReviewPhotos(@Param("semoId") Long semoId,
                                   @Param("participantId") Long participantId,
                                   @Param("statuses") Collection<PhotoMatchStatus> statuses);

    long countBySemo_IdAndParticipant_IdAndMatchStatusIn(Long semoId, Long participantId,
                                                         Collection<PhotoMatchStatus> statuses);
}