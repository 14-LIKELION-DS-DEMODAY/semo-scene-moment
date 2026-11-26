package com.semo.semoserver.invite.controller;

import com.semo.semoserver.global.auth.CurrentGuest;
import com.semo.semoserver.global.common.ApiResponse;
import com.semo.semoserver.invite.dto.InvitationResponse;
import com.semo.semoserver.invite.dto.InviteInfoResponse;
import com.semo.semoserver.invite.dto.JoinRequest;
import com.semo.semoserver.invite.dto.JoinResponse;
import com.semo.semoserver.invite.service.InviteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "초대·참여", description = "친구 초대, 초대 코드 조회, 세모 참여, QR")
@RestController
@RequiredArgsConstructor
public class InviteController {

    private final InviteService inviteService;

    @Operation(summary = "친구 초대하기 화면", description = "이 세모에 참여한 사람만 조회 가능")
    @GetMapping("/api/semos/{semoId}/invite")
    public ApiResponse<InviteInfoResponse> getInviteInfo(
            @CurrentGuest Long guestId,
            @PathVariable Long semoId) {
        return ApiResponse.ok(inviteService.getInviteInfo(guestId, semoId));
    }

    @Operation(summary = "초대받은 세모 정보", description = "없는 코드면 404 INVITE_NOT_FOUND")
    @GetMapping("/api/invites/{inviteCode}")
    public ApiResponse<InvitationResponse> getInvitation(
            @CurrentGuest Long guestId,
            @PathVariable String inviteCode) {
        return ApiResponse.ok(inviteService.getInvitation(guestId, inviteCode));
    }

    @Operation(summary = "세모 참여", description = "닉네임 1~10자. 중복이면 409 DUPLICATE_NICKNAME, 이미 참여했으면 409 ALREADY_JOINED")
    @PostMapping("/api/invites/{inviteCode}/participants")
    public ApiResponse<JoinResponse> join(
            @CurrentGuest Long guestId,
            @PathVariable String inviteCode,
            @Valid @RequestBody JoinRequest request) {
        return ApiResponse.ok(inviteService.join(guestId, inviteCode, request.nickname()));
    }

    @Operation(summary = "초대 QR 코드 (PNG)", description = "게스트 키 없이 호출 가능. <img src=\"/api/invites/{코드}/qr\">로 바로 사용")
    @GetMapping(value = "/api/invites/{inviteCode}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQr(
            @PathVariable String inviteCode,
            @RequestParam(defaultValue = "300") int size) {
        return inviteService.getQrPng(inviteCode, size)
                .map(png -> ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(png))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
