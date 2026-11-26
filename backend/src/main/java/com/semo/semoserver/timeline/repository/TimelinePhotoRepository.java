package com.semo.semoserver.timeline.repository;

import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.entity.PhotoMatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimelinePhotoRepository extends JpaRepository<Photo, Long> {

    // 촬영 시각이 없는 사진 수 (시간 미확인 영역)
    long countBySemo_IdAndMatchStatus(Long semoId, PhotoMatchStatus matchStatus);
}
