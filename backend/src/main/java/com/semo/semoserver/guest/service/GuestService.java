package com.semo.semoserver.guest.service;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.guest.dto.DefaultNicknameResponse;
import com.semo.semoserver.guest.dto.GuestKeyResponse;
import com.semo.semoserver.guest.dto.GuestMeResponse;
import com.semo.semoserver.guest.entity.Guest;
import com.semo.semoserver.guest.repository.GuestRepository;
import com.semo.semoserver.participant.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuestService {

    private final GuestRepository guestRepository;
    private final ParticipantRepository participantRepository;

    @Transactional
    public GuestKeyResponse issueGuestKey() {
        Guest guest = guestRepository.save(Guest.create());
        return new GuestKeyResponse(guest.getGuestKey());
    }

    public GuestMeResponse getMe(Long guestId) {
        Guest guest = getGuest(guestId);
        boolean hasSeomo = participantRepository.existsByGuest_Id(guestId);
        return new GuestMeResponse(guest.getDefaultNickname(), hasSeomo);
    }

    // 새로 참여하는 세모부터 적용
    @Transactional
    public DefaultNicknameResponse changeDefaultNickname(Long guestId, String nickname) {
        Guest guest = getGuest(guestId);
        guest.changeDefaultNickname(nickname.strip());
        return new DefaultNicknameResponse(guest.getDefaultNickname());
    }

    // 게스트 엔티티가 필요시 사용
    public Guest getGuest(Long guestId) {
        return guestRepository.findById(guestId)
                .orElseThrow(() -> new CustomException(ErrorCode.UNAUTHORIZED_GUEST));
    }
}
