package com.semo.semoserver.comment.controller;

import com.semo.semoserver.comment.dto.CommentRequest;
import com.semo.semoserver.comment.dto.CommentResponse;
import com.semo.semoserver.comment.service.CommentService;
import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "댓글")
@RestController
@RequestMapping("/api/photos/{photoId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "댓글 목록 (모두 보기)", description = "오래된 순")
    @GetMapping
    public ApiResponse<List<CommentResponse>> getComments(@CurrentGuest Long guestId, @PathVariable Long photoId) {
        return ApiResponse.ok(commentService.getComments(guestId, photoId));
    }

    @Operation(summary = "댓글 작성", description = "1~200자")
    @PostMapping
    public ApiResponse<CommentResponse> create(
            @CurrentGuest Long guestId,
            @PathVariable Long photoId,
            @Valid @RequestBody CommentRequest request) {
        return ApiResponse.ok(commentService.create(guestId, photoId, request.content()));
    }
}
