package com.semo.semoserver.semo.service;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.global.image.ImageSanitizer;
import com.semo.semoserver.global.storage.FileStorage;
import com.semo.semoserver.guest.entity.Guest;
import com.semo.semoserver.guest.service.GuestService;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.participant.entity.ParticipantRole;
import com.semo.semoserver.participant.repository.ParticipantRepository;
import com.semo.semoserver.semo.dto.SemoCreateRequest;
import com.semo.semoserver.semo.dto.SemoCreateResponse;
import com.semo.semoserver.semo.entity.Semo;
import com.semo.semoserver.semo.repository.SemoRepository;
import com.semo.semoserver.semo.util.InviteCodeGenerator;
import com.semo.semoserver.semo.util.InviteLinkProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SemoService {

    private final SemoRepository semoRepository;
    private final ParticipantRepository participantRepository;
    private final GuestService guestService;
    private final InviteCodeGenerator inviteCodeGenerator;
    private final InviteLinkProvider inviteLinkProvider;
    private final ImageSanitizer imageSanitizer;
    private final FileStorage fileStorage;

    @Transactional
    public SemoCreateResponse create(Long guestId, SemoCreateRequest request) {
        // 같은 requestId로 이미 만든 세모가 있으면 새로 만들지 않음
        Optional<SemoCreateResponse> alreadyCreated = findCreatedByRequestId(guestId, request.getRequestId());
        if (alreadyCreated.isPresent()) {
            return alreadyCreated.get();
        }

        Guest guest = guestService.getGuest(guestId);
        String name = request.getName().strip();
        String nickname = request.getNickname().strip();

        // 세모 저장
        Semo semo = Semo.create(name, inviteCodeGenerator.generate(), request.getRequestId());

        // 대표 사진이 있으면 위치 정보를 지운 사본만 저장
        MultipartFile coverImage = request.getCoverImage();
        if (coverImage != null && !coverImage.isEmpty()) {
            ImageSanitizer.SanitizedImage sanitized = imageSanitizer.stripMetadata(coverImage);
            String key = fileStorage.upload(sanitized.bytes(), "covers", sanitized.extension());
            semo.changeCoverImageKey(key);
        }
        semoRepository.save(semo);

        // 만든 사람은 OWNER로 자동 참여
        participantRepository.save(Participant.create(semo, guest, nickname, ParticipantRole.OWNER));

        // 기본 닉네임이 없으면 이번 닉네임을 기본 닉네임으로
        guest.setDefaultNicknameIfAbsent(nickname);

        return toCreateResponse(semo);
    }

    /**
     * requestId로 이미 만든 세모를 찾는다. 다른 사람이 만든 세모의 requestId면 403.
     * 컨트롤러에서 동시에 두 요청이 들어와 유니크 제약에 걸렸을 때도 이걸로 결과를 돌려준다.
     */
    public Optional<SemoCreateResponse> findCreatedByRequestId(Long guestId, String requestId) {
        return semoRepository.findByCreateRequestId(requestId)
                .map(semo -> {
                    participantRepository.findBySemo_IdAndGuest_Id(somo.getId(), guestId)
                            .filter(Participant::isOwner)
                            .orElseThrow(() -> new CustomException(ErrorCode.FORBIDDEN));
                    return toCreateResponse(semo);
                });
    }

    private SemoCreateResponse toCreateResponse(Semo semo) {
        return new SemoCreateResponse(
                semo.getId(),
                semo.getName(),
                semo.getInviteCode(),
                inviteLinkProvider.inviteUrl(semo.getInviteCode()));
    }
}
