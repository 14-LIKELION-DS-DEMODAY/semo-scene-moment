package com.semo.semoserver.invite.dto;

import java.util.List;

public record InviteInfoResponse(
        Long semoId,
        String name,
        String inviteCode,
        String inviteUrl,
        int participantCount,
        List<ParticipantSummary> participants
) {
}
