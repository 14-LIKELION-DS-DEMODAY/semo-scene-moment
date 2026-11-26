package com.semo.semoserver.semo.repository;

import com.semo.semoserver.semo.entity.Semo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SemoRepository extends JpaRepository<Semo, Long> {

    boolean existsByInviteCode(String inviteCode);

    Optional<Semo> findByInviteCode(String inviteCode);

    Optional<Semo> findByCreateRequestId(String createRequestId);
}
