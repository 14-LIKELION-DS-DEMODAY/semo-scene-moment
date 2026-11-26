package com.semo.semoserver.home.dto;

import com.semo.semoserver.participant.entity.ParticipantRole;

import java.time.LocalDate;

// 세모 카드
public record SemoCard(
        Long semoId,
        String name,
        String coverImageUrl,   // 대표 사진이 없으면 null
        LocalDate date,         // 첫 촬영 날짜. 사진이 없으면 세모를 만든 날짜
        long photoCount,
        long participantCount,
        ParticipantRole role    // OWNER / MEMBER
) {
}
