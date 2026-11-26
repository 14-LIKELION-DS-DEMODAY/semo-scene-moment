package com.semo.semoserver.photo.repository;

import com.semo.semoserver.moment.dto.MomentCount;
import com.semo.semoserver.moment.dto.MomentPhotoKey;
import com.semo.semoserver.moment.dto.PhotographerSummary;
import com.semo.semoserver.photo.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PhotoQueryRepository extends JpaRepository<Photo, Long> {

    long countByMoment_Id(Long momentId);

    // 사진 + 올린 사람 + 세모를 한 번에
    @Query("select p from Photo p join fetch p.participant join fetch p.semo left join fetch p.moment "
            + "where p.id = :photoId")
    Optional<Photo> findDetailById(@Param("photoId") Long photoId);

    // Moment 사진 촬영 시각 순
    @Query("select p from Photo p join fetch p.participant "
            + "where p.moment.id = :momentId order by p.takenAt asc, p.id asc")
    List<Photo> findMomentPhotos(@Param("momentId") Long momentId);

    // Moment 촬영자별 사진 수
    @Query("select new com.semo.server.moment.dto.PhotographerSummary(pa.id, pa.nickname, count(p)) "
            + "from Photo p join p.participant pa where p.moment.id = :momentId "
            + "group by pa.id, pa.nickname order by pa.id asc")
    List<PhotographerSummary> findPhotographers(@Param("momentId") Long momentId);

    // 세모 안 Moment별 참여자 수
    @Query("select new com.semo.server.moment.dto.MomentCount(p.moment.id, count(distinct p.participant.id)) "
            + "from Photo p where p.semo.id = :semoId and p.moment is not null group by p.moment.id")
    List<MomentCount> countParticipantsByMoment(@Param("semoId") Long semoId);

    // 세모 안 Moment별 사진 키
    @Query("select new com.semo.server.moment.dto.MomentPhotoKey(p.moment.id, p.storageKey) "
            + "from Photo p where p.semo.id = :semoId and p.moment is not null "
            + "order by p.takenAt asc, p.id asc")
    List<MomentPhotoKey> findPhotoKeysBySemo(@Param("semoId") Long semoId);
}
