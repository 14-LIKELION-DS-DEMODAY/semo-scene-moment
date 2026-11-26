package com.semo.semoserver.semo.util;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.semo.repository.SemoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * 6자리 랜덤 초대 코드. 헷갈리는 글자(0, O, 1, I, L)는 뺐다.
 * 31^6 ≒ 8.9억 개라 겹칠 일이 거의 없지만, 겹치면 다시 뽑는다.
 */
@Component
@RequiredArgsConstructor
public class InviteCodeGenerator {

    private static final String CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 6;
    private static final int MAX_TRY = 10;

    private final SecureRandom random = new SecureRandom();
    private final SemoRepository semoRepository;

    public String generate() {
        for (int i = 0; i < MAX_TRY; i++) {
            String code = randomCode();
            if (!semoRepository.existsByInviteCode(code)) {
                return code;
            }
        }
        throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
    }

    private String randomCode() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
