package com.semo.semoserver.participant.service;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.participant.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * "이 게스트가 이 세모의 참여자인가"를 확인하고, 참여자(participant)를 돌려준다.
 * 사진·좋아요·댓글은 guest가 아니라 participant에 연결되므로 거의 모든 API에서 쓴다.
 */
@Component
@RequiredArgsConstructor
public class SemoAccessChecker {

    private final ParticipantRepository participantRepository;

    public Participant getMyParticipant(Long semoId, Long guestId) {
        return participantRepository.findBySemo_IdAndGuest_Id(semoId, guestId)
                .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));
    }
}
