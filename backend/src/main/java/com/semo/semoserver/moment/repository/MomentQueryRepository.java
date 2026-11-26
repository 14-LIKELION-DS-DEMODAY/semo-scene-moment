package com.semo.semoserver.moment.repository;

import com.semo.semoserver.moment.entity.Moment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MomentQueryRepository extends JpaRepository<Moment, Long> {

    @Query("select m from Moment m join fetch m.semo left join fetch m.representativePhoto where m.id = :momentId")
    Optional<Moment> findDetailById(@Param("momentId") Long momentId);

    @Query("select m from Moment m left join fetch m.representativePhoto "
            + "where m.semo.id = :semoId order by m.startAt asc, m.id asc")
    List<Moment> findAllBySemoId(@Param("semoId") Long semoId);
}
