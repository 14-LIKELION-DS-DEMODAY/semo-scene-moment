package com.semo.semoserver.home.dto;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;

import java.util.Locale;

public enum SemoSort {
    ACTIVITY, // 활동순: semo.last_activity_at 최신순
    CREATED,  // 생성순: 세모를 만든 시각 기준 최신순
    DATE;     // 날짜순: 카드의 date 최신순

    // 잘못된 값이 오면 400 INVALID_INPUT
    public static SemoSort from(String value) {
        if (value == null || value.isBlank()) {
            return ACTIVITY;
        }
        try {
            return SemoSort.valueOf(value.strip().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }
    }
}
