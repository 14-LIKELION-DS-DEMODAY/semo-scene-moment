package com.semo.semoserver.invite.dto;

import java.util.List;

public record InvitationResponse(
        Long semoId,
        String name,
        int participantCount,
        List<ParticipantSummary> participants,
        boolean alreadyJoined,     // true면 세모 보기로 이동
        String suggestedNickname   // 기본 닉네임. 없으면 null
) {
}
