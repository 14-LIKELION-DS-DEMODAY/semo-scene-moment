package com.semo.semoserver.guest.repository;

import com.semo.semoserver.guest.entity.Guest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, Long> {

    // 인증시 id만 조회
    @Query("select g.id from Guest g where g.guestKey = :guestKey")
    Optional<Long> findIdByGuestKey(@Param("guestKey") String guestKey);
}
