package com.semo.semoserver.photo.entity;

public enum PhotoMatchStatus {
    MATCHED,       // 확정
    NEEDS_REVIEW,  // 사용자 확인 필요
    UNCLASSIFIED   // 촬영 시각 없음
}
