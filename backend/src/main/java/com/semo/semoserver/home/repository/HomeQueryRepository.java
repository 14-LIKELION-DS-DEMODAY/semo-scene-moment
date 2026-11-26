package com.semo.semoserver.home.repository;

import com.semo.semoserver.home.dto.SemoCount;
import com.semo.semoserver.home.dto.SemoPhotoStat;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.entity.PhotoMatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

/**
 * 홈·목록 화면 전용 조회 쿼리 모음
 */
public interface HomeQueryRepository extends JpaRepository<Photo, Long> {

    // 내가 참여한 세모들
    @Query("select pa from Participant pa join fetch pa.semo where pa.guest.id = :guestId")
    List<Participant> findMyParticipations(@Param("guestId") Long guestId);

    // 세모별 사진 수 + 첫 촬영 시각
    @Query("select new com.semo.semoserver.home.dto.SemoPhotoStat(p.semo.id, count(p), min(p.takenAt)) "
            + "from Photo p where p.semo.id in :semoIds group by p.semo.id")
    List<SemoPhotoStat> findPhotoStats(@Param("semoIds") Collection<Long> semoIds);

    // 세모별 참여자 수
    @Query("select new com.semo.semoserver.home.dto.SemoCount(pa.semo.id, count(pa)) "
            + "from Participant pa where pa.semo.id in :semoIds group by pa.semo.id")
    List<SemoCount> countParticipants(@Param("semoIds") Collection<Long> semoIds);

    // 내가 올린 사진 중 확인이 필요한 사진 수
    @Query("select new com.semo.semoserver.home.dto.SemoCount(p.semo.id, count(p)) "
            + "from Photo p where p.participant.guest.id = :guestId and p.matchStatus in :statuses "
            + "group by p.semo.id")
    List<SemoCount> countReviewPhotos(@Param("guestId") Long guestId,
                                       @Param("statuses") Collection<PhotoMatchStatus> statuses);
}
