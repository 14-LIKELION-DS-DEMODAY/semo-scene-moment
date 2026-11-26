package com.semo.semoserver.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank(message = "댓글을 입력해 주세요.")
        @Size(max = 200, message = "댓글은 1~200자로 입력해 주세요.")
        String content
) {
}
