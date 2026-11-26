package com.semo.semoserver.review.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.review.dto.AssignRequest;
import com.semo.semoserver.review.dto.AssignResponse;
import com.semo.semoserver.review.dto.ReviewPhotoItem;
import com.semo.semoserver.review.service.PhotoReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "사진 확인 (A)")
@RestController
@RequiredArgsConstructor
public class PhotoReviewController {

    private final PhotoReviewService photoReviewService;

    @Operation(summary = "확인이 필요한 사진 목록",
            description = "내가 올린 사진 중 GPS가 없거나 후보가 여러 개거나 촬영 시각이 없는 사진. candidates가 비어 있으면 새 Moment로 넣기")
    @GetMapping("/api/semos/{semoId}/review-photos")
    public ApiResponse<List<ReviewPhotoItem>> getReviewPhotos(
            @CurrentGuest Long guestId,
            @PathVariable Long semoId) {
        return ApiResponse.ok(photoReviewService.getReviewPhotos(guestId, semoId));
    }

    @Operation(summary = "사진을 Moment에 넣기",
            description = "{\"momentId\": 3} 또는 {\"newMoment\": true} 중 하나만 보냄")
    @PostMapping("/api/photos/{photoId}/assign")
    public ApiResponse<AssignResponse> assign(
            @CurrentGuest Long guestId,
            @PathVariable Long photoId,
            @RequestBody AssignRequest request) {
        return ApiResponse.ok(photoReviewService.assign(guestId, photoId, request));
    }
}