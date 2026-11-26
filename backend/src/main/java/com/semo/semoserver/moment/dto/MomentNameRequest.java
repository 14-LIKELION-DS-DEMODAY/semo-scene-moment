package com.semo.semoserver.moment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MomentNameRequest(
        @NotBlank(message = "Moment 이름을 입력해 주세요.")
        @Size(max = 30, message = "Moment 이름은 1~30자로 입력해 주세요.")
        String name
) {
}
