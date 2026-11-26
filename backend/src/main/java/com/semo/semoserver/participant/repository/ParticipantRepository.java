package com.semo.semoserver.participant.repository;

import com.semo.semoserver.participant.entity.Participant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {

    boolean existsByGuest_Id(Long guestId);

    boolean existsBySemo_IdAndGuest_Id(Long semoId, Long guestId);

    boolean existsBySemo_IdAndNickname(Long semoId, String nickname);

    Optional<Participant> findBySemo_IdAndGuest_Id(Long semoId, Long guestId);

    List<Participant> findBySemo_IdOrderByIdAsc(Long semoId);
}
