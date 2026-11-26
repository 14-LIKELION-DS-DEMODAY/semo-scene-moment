package com.semo.semoserver.moment.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.moment.dto.MomentDetailResponse;
import com.semo.semoserver.moment.dto.MomentListItem;
import com.semo.semoserver.moment.dto.MomentNameRequest;
import com.semo.semoserver.moment.dto.MomentNameResponse;
import com.semo.semoserver.moment.service.MomentDetailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "Moment 상세 (B)")
@RestController
@RequiredArgsConstructor
public class MomentDetailController {

    private final MomentDetailService momentDetailService;

    @Operation(summary = "Moment 보기", description = "participantId를 보내면 그 촬영자 사진만. 삭제된 Moment면 404 MOMENT_NOT_FOUND")
    @GetMapping("/api/moments/{momentId}")
    public ApiResponse<MomentDetailResponse> getMoment(
            @CurrentGuest Long guestId,
            @PathVariable Long momentId,
            @RequestParam(required = false) Long participantId) {
        return ApiResponse.ok(momentDetailService.getMoment(guestId, momentId, participantId));
    }

    @Operation(summary = "Moment 이름 변경", description = "1~30자")
    @PatchMapping("/api/moments/{momentId}")
    public ApiResponse<MomentNameResponse> rename(
            @CurrentGuest Long guestId,
            @PathVariable Long momentId,
            @Valid @RequestBody MomentNameRequest request) {
        return ApiResponse.ok(momentDetailService.rename(guestId, momentId, request.name()));
    }

    @Operation(summary = "세모의 Moment 목록 (다른 Moment로 이동 시트)", description = "excludeMomentId로 지금 Moment를 뺌")
    @GetMapping("/api/semos/{semoId}/moments")
    public ApiResponse<List<MomentListItem>> getMoments(
            @CurrentGuest Long guestId,
            @PathVariable Long semoId,
            @RequestParam(required = false) Long excludeMomentId) {
        return ApiResponse.ok(momentDetailService.getMoments(guestId, semoId, excludeMomentId));
    }
}
