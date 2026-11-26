package com.semo.semoserver.like.repository;

import com.semo.semoserver.like.entity.PhotoLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PhotoLikeRepository extends JpaRepository<PhotoLike, Long> {

    long countByPhoto_Id(Long photoId);

    boolean existsByPhoto_IdAndParticipant_Id(Long photoId, Long participantId);

    @Modifying(flushAutomatically = true)
    @Query("delete from PhotoLike l where l.photo.id = :photoId and l.participant.id = :participantId")
    int deleteByPhotoAndParticipant(@Param("photoId") Long photoId, @Param("participantId") Long participantId);

    // 사진 삭제 전에 해당 사진의 좋아요를 모두 지움
    @Modifying(flushAutomatically = true)
    @Query("delete from PhotoLike l where l.photo.id = :photoId")
    int deleteAllByPhotoId(@Param("photoId") Long photoId);
}
