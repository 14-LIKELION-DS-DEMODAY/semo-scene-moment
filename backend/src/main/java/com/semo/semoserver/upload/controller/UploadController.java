package com.semo.semoserver.upload.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.upload.dto.PhotoUploadResponse;
import com.semo.semoserver.upload.dto.UploadResultResponse;
import com.semo.semoserver.upload.dto.UploadStartRequest;
import com.semo.semoserver.upload.dto.UploadStartResponse;
import com.semo.semoserver.upload.dto.UploadStatusResponse;
import com.semo.semoserver.upload.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "사진 업로드·분석 (A)")
@RestController
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @Operation(summary = "업로드 시작", description = "선택한 사진 수(1~30)를 보내면 uploadId를 돌려줌")
    @PostMapping("/api/semos/{semoId}/uploads")
    public ApiResponse<UploadStartResponse> start(
            @CurrentGuest Long guestId,
            @PathVariable Long semoId,
            @Valid @RequestBody UploadStartRequest request) {
        return ApiResponse.ok(uploadService.start(guestId, semoId, request.totalCount()));
    }

    @Operation(summary = "사진 1장 전송", description = "multipart/form-data, file 필드. JPEG·PNG, 20MB 이하")
    @PostMapping(value = "/api/uploads/{uploadId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<PhotoUploadResponse> uploadPhoto(
            @CurrentGuest Long guestId,
            @PathVariable Long uploadId,
            @RequestPart("file") MultipartFile file) {
        return ApiResponse.ok(uploadService.uploadPhoto(guestId, uploadId, file));
    }

    @Operation(summary = "업로드 완료 (분석 시작)", description = "1차 버전은 응답 전에 분석까지 끝남")
    @PostMapping("/api/uploads/{uploadId}/complete")
    public ApiResponse<UploadStatusResponse> complete(
            @CurrentGuest Long guestId,
            @PathVariable Long uploadId) {
        return ApiResponse.ok(uploadService.complete(guestId, uploadId));
    }

    @Operation(summary = "분석 상태 조회")
    @GetMapping("/api/uploads/{uploadId}")
    public ApiResponse<UploadStatusResponse> getStatus(
            @CurrentGuest Long guestId,
            @PathVariable Long uploadId) {
        return ApiResponse.ok(uploadService.getStatus(guestId, uploadId));
    }

    @Operation(summary = "매칭 결과")
    @GetMapping("/api/uploads/{uploadId}/result")
    public ApiResponse<UploadResultResponse> getResult(
            @CurrentGuest Long guestId,
            @PathVariable Long uploadId) {
        return ApiResponse.ok(uploadService.getResult(guestId, uploadId));
    }
}