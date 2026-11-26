package com.semo.semoserver.guest.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.guest.dto.DefaultNicknameRequest;
import com.semo.semoserver.guest.dto.DefaultNicknameResponse;
import com.semo.semoserver.guest.dto.GuestKeyResponse;
import com.semo.semoserver.guest.dto.GuestMeResponse;
import com.semo.semoserver.guest.service.GuestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "게스트", description = "게스트 키 발급, 내 정보, 기본 닉네임")
@RestController
@RequestMapping("/api/guests")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    @Operation(summary = "게스트 키 발급", description = "헤더 없이 호출. 받은 키를 기기에 저장하고 이후 X-Guest-Key로 보냄")
    @PostMapping
    public ApiResponse<GuestKeyResponse> issueGuestKey() {
        return ApiResponse.ok(guestService.issueGuestKey());
    }

    @Operation(summary = "내 정보", description = "첫 진입 분기(hasSeomo)와 인사 문구용 기본 닉네임")
    @GetMapping("/me")
    public ApiResponse<GuestMeResponse> getMe(@CurrentGuest Long guestId) {
        return ApiResponse.ok(guestService.getMe(guestId));
    }

    @Operation(summary = "기본 닉네임 변경 (마이)", description = "1~10자. 새로 참여하는 세모부터 적용")
    @PatchMapping("/me/nickname")
    public ApiResponse<DefaultNicknameResponse> changeDefaultNickname(
            @CurrentGuest Long guestId,
            @Valid @RequestBody DefaultNicknameRequest request) {
        return ApiResponse.ok(guestService.changeDefaultNickname(guestId, request.defaultNickname()));
    }
}
