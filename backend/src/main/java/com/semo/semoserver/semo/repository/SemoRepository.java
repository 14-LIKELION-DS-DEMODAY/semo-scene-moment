package com.semo.semoserver.semo.repository;

import com.semo.semoserver.semo.entity.Seomo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeomoRepository extends JpaRepository<Seomo, Long> {

    boolean existsByInviteCode(String inviteCode);

    Optional<Seomo> findByInviteCode(String inviteCode);

    Optional<Seomo> findByCreateRequestId(String createRequestId);
}
