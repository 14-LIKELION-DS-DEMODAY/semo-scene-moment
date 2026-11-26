package com.semo.semoserver.like.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.like.dto.LikeResponse;
import com.semo.semoserver.like.service.PhotoLikeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "좋아요")
@RestController
@RequestMapping("/api/photos/{photoId}/likes")
@RequiredArgsConstructor
public class PhotoLikeController {

    private final PhotoLikeService photoLikeService;

    @Operation(summary = "좋아요")
    @PostMapping
    public ApiResponse<LikeResponse> like(@CurrentGuest Long guestId, @PathVariable Long photoId) {
        try {
            return ApiResponse.ok(photoLikeService.like(guestId, photoId));
        } catch (DataIntegrityViolationException e) {
            return ApiResponse.ok(photoLikeService.getState(guestId, photoId));
        }
    }

    @Operation(summary = "좋아요 취소")
    @DeleteMapping
    public ApiResponse<LikeResponse> unlike(@CurrentGuest Long guestId, @PathVariable Long photoId) {
        return ApiResponse.ok(photoLikeService.unlike(guestId, photoId));
    }
}
