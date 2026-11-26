package com.semo.semoserver.upload.repository;

import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.entity.PhotoMatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

/**
 * 업로드·분석에서 쓰는 사진 조회 (B의 PhotoQueryRepository와 겹치지 않게 따로 둠)
 */
public interface UploadPhotoRepository extends JpaRepository<Photo, Long> {

    // 이번 업로드의 사진, 촬영 시각 순
    @Query("select p from Photo p where p.uploadBatch.id = :batchId order by p.takenAt asc, p.id asc")
    List<Photo> findBatchPhotos(@Param("batchId") Long batchId);

    // 이번 업로드 사진이 들어간 Moment id
    @Query("select distinct p.moment.id from Photo p where p.uploadBatch.id = :batchId and p.moment is not null")
    List<Long> findMomentIdsByBatch(@Param("batchId") Long batchId);

    // 이번 업로드 중 확인이 필요한 사진 수
    long countByUploadBatch_IdAndMatchStatusIn(Long batchId, Collection<PhotoMatchStatus> statuses);
}