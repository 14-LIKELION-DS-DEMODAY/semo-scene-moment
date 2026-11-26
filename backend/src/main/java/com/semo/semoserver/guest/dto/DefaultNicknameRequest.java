package com.semo.semoserver.guest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DefaultNicknameRequest(
        @NotBlank(message = "닉네임을 입력해 주세요.")
        @Size(max = 10, message = "닉네임은 1~10자로 입력해 주세요.")
        String defaultNickname
) {
}
