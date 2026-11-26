package com.semo.semoserver.photo.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.photo.dto.PhotoDeleteResponse;
import com.semo.semoserver.photo.dto.PhotoDetailResponse;
import com.semo.semoserver.photo.dto.PhotoMoveRequest;
import com.semo.semoserver.photo.dto.PhotoMoveResponse;
import com.semo.semoserver.photo.service.PhotoDetailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "사진 상세 (B)")
@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoDetailService photoDetailService;

    @Operation(summary = "사진 보기", description = "participantId: 촬영자 필터로 들어왔을 때. 이전/다음은 순환")
    @GetMapping("/{photoId}")
    public ApiResponse<PhotoDetailResponse> getPhoto(
            @CurrentGuest Long guestId,
            @PathVariable Long photoId,
            @RequestParam(required = false) Long participantId) {
        return ApiResponse.ok(photoDetailService.getPhoto(guestId, photoId, participantId));
    }

    @Operation(summary = "사진 삭제", description = "본인이 올린 사진만. 남의 사진이면 403 FORBIDDEN")
    @DeleteMapping("/{photoId}")
    public ApiResponse<PhotoDeleteResponse> delete(
            @CurrentGuest Long guestId,
            @PathVariable Long photoId) {
        return ApiResponse.ok(photoDetailService.delete(guestId, photoId));
    }

    @Operation(summary = "다른 Moment로 이동")
    @PatchMapping("/{photoId}/moment")
    public ApiResponse<PhotoMoveResponse> move(
            @CurrentGuest Long guestId,
            @PathVariable Long photoId,
            @Valid @RequestBody PhotoMoveRequest request) {
        return ApiResponse.ok(photoDetailService.move(guestId, photoId, request.momentId()));
    }
}
