package com.semo.semoserver.upload.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UploadStartRequest(
        @NotNull(message = "선택한 사진 수를 보내 주세요.")
        @Min(value = 1, message = "사진을 1장 이상 선택해 주세요.")
        @Max(value = 30, message = "한 번에 30장까지 올릴 수 있어요.")
        Integer totalCount
) {
}
