package com.semo.semoserver.photo.dto;

import jakarta.validation.constraints.NotNull;

public record PhotoMoveRequest(
        @NotNull(message = "옮길 Moment를 선택해 주세요.")
        Long momentId
) {
}
