package com.semo.semoserver.semo.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.semo.dto.SemoCreateRequest;
import com.semo.semoserver.semo.dto.SemoCreateResponse;
import com.semo.semoserver.semo.service.SemoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "세모", description = "세모 생성")
@RestController
@RequestMapping("/api/semos")
@RequiredArgsConstructor
public class SemoController {

    private final SemoService semoService;

    @Operation(summary = "세모 만들기", description = "multipart/form-data. name 1~30자, nickname 1~10자, requestId(UUID), coverImage 선택")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<SemoCreateResponse> create(
            @CurrentGuest Long guestId,
            @Valid @ModelAttribute SemoCreateRequest request) {
        try {
            return ApiResponse.ok(semoService.create(guestId, request));
        } catch (DataIntegrityViolationException e) {
            // 같은 요청 두 개가 동시에 들어와서 제약에 걸린 경우: 먼저 성공한 것 리턴
            return ApiResponse.ok(semoService.findCreatedByRequestId(guestId, request.getRequestId())
                    .orElseThrow(() -> e));
        }
    }
}
