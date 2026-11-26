package com.semo.semoserver.guest.dto;

public record GuestMeResponse(
        String defaultNickname, // null이면 일반 환영 문구 
        boolean hasSeomo        // false면 신규 홈, true면 일반 홈
) {
}
