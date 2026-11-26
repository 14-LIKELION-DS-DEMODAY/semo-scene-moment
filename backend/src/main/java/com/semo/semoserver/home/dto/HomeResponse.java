package com.semo.semoserver.home.dto;

import java.util.List;

public record HomeResponse(
        String nickname,                       // 기본 닉네임
        ContinueOrganizing continueOrganizing, // 없으면 null
        SemoCard recentSemo,                 // 이어 보기
        List<SemoCard> semos                 // 활동순 최대 3개
) {
}
