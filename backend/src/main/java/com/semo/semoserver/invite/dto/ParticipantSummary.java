package com.semo.semoserver.invite.dto;

import com.semo.semoserver.participant.entity.Participant;

public record ParticipantSummary(Long participantId, String nickname) {

    public static ParticipantSummary from(Participant participant) {
        return new ParticipantSummary(participant.getId(), participant.getNickname());
    }
}
