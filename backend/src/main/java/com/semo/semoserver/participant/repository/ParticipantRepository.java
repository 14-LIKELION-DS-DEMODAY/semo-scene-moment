package com.semo.semoserver.participant.repository;

import com.semo.semoserver.participant.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    boolean existsByGuest_Id(Long guestId);

    boolean existsBySeomo_IdAndGuest_Id(Long seomoId, Long guestId);

    boolean existsBySeomo_IdAndNickname(Long seomoId, String nickname);

    Optional<Participant> findBySeomo_IdAndGuest_Id(Long seomoId, Long guestId);

    List<Participant> findBySeomo_IdOrderByIdAsc(Long seomoId);
}
