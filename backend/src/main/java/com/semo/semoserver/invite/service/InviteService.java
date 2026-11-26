package com.semo.semoserver.invite.service;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.guest.entity.Guest;
import com.semo.semoserver.guest.service.GuestService;
import com.semo.semoserver.invite.dto.InvitationResponse;
import com.semo.semoserver.invite.dto.InviteInfoResponse;
import com.semo.semoserver.invite.dto.JoinResponse;
import com.semo.semoserver.invite.dto.ParticipantSummary;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.participant.entity.ParticipantRole;
import com.semo.semoserver.participant.repository.ParticipantRepository;
import com.semo.semoserver.semo.entity.Semo;
import com.semo.semoserver.semo.repository.SemoRepository;
import com.semo.semoserver.semo.util.InviteLinkProvider;
import com.semo.semoserver.semo.util.QrCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InviteService {

    private final SemoRepository semoRepository;
    private final ParticipantRepository participantRepository;
    private final GuestService guestService;
    private final InviteLinkProvider inviteLinkProvider;
    private final QrCodeGenerator qrCodeGenerator;

    // 친구 초대하기 화면
    public InviteInfoResponse getInviteInfo(Long guestId, Long semoId) {
        Semo semo = semoRepository.findById(semoId)
                .orElseThrow(() -> new CustomException(ErrorCode.SEMO_NOT_FOUND));
        if (!participantRepository.existsBySemo_IdAndGuest_Id(semoId, guestId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        List<ParticipantSummary> participants = getParticipants(semoId);
        return new InviteInfoResponse(
                semo.getId(),
                semo.getName(),
                semo.getInviteCode(),
                inviteLinkProvider.inviteUrl(semo.getInviteCode()),
                participants.size(),
                participants);
    }

    // 참여하기 화면
    public InvitationResponse getInvitation(Long guestId, String inviteCode) {
        Semo semo = findByInviteCode(inviteCode);
        Guest guest = guestService.getGuest(guestId);
        List<ParticipantSummary> participants = getParticipants(semo.getId());
        boolean alreadyJoined = participantRepository.existsBySemo_IdAndGuest_Id(semo.getId(), guestId);
        return new InvitationResponse(
                semo.getId(),
                semo.getName(),
                participants.size(),
                participants,
                alreadyJoined,
                guest.getDefaultNickname());
    }

    // 세모 참여
    @Transactional
    public JoinResponse join(Long guestId, String inviteCode, String rawNickname) {
        Semo semo = findByInviteCode(inviteCode);
        String nickname = rawNickname.strip();

        if (participantRepository.existsBySemo_IdAndGuest_Id(semo.getId(), guestId)) {
            throw new CustomException(ErrorCode.ALREADY_JOINED);
        }
        if (participantRepository.existsBySemo_IdAndNickname(semo.getId(), nickname)) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }

        Guest guest = guestService.getGuest(guestId);
        Participant participant = participantRepository.save(
                Participant.create(semo, guest, nickname, ParticipantRole.MEMBER));

        guest.setDefaultNicknameIfAbsent(nickname);
        semo.touchActivity(); // 참여도 활동순에 반영

        return new JoinResponse(semo.getId(), participant.getId());
    }

    // QR 코드 PNG
    public Optional<byte[]> getQrPng(String inviteCode, int size) {
        String code = normalize(inviteCode);
        if (!semoRepository.existsByInviteCode(code)) {
            return Optional.empty();
        }
        int clamped = Math.max(100, Math.min(size, 1000));
        return Optional.of(qrCodeGenerator.generatePng(inviteLinkProvider.inviteUrl(code), clamped));
    }

    private Semo findByInviteCode(String inviteCode) {
        return semoRepository.findByInviteCode(normalize(inviteCode))
                .orElseThrow(() -> new CustomException(ErrorCode.INVITE_NOT_FOUND));
    }

    // 사용자가 소문자로 입력해도 찾을 수 있게
    private String normalize(String inviteCode) {
        return inviteCode == null ? "" : inviteCode.strip().toUpperCase(Locale.ROOT);
    }

    private List<ParticipantSummary> getParticipants(Long semoId) {
        return participantRepository.findBySemo_IdOrderByIdAsc(semoId).stream()
                .map(ParticipantSummary::from)
                .toList();
    }
}
