package com.semo.semoserver.global.auth;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.guest.repository.GuestRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * /api/** 요청마다 X-Guest-Key 헤더를 확인한다.
 * 헤더가 없거나 DB에 없는 키면 401 UNAUTHORIZED_GUEST.
 * 확인되면 guestId를 request attribute에 넣어 두고, @CurrentGuest로 꺼내 쓴다.
 */
@Component
@RequiredArgsConstructor
public class GuestAuthInterceptor implements HandlerInterceptor {

    public static final String GUEST_KEY_HEADER = "X-Guest-Key";
    public static final String GUEST_ID_ATTRIBUTE = "guestId";

    private final GuestRepository guestRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }
        // 컨트롤러 메서드가 아닌 요청은 검사x
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String guestKey = request.getHeader(GUEST_KEY_HEADER);
        if (guestKey == null || guestKey.isBlank() || guestKey.strip().length() > 36) {
            throw new CustomException(ErrorCode.UNAUTHORIZED_GUEST);
        }

        Long guestId = guestRepository.findIdByGuestKey(guestKey.strip())
                .orElseThrow(() -> new CustomException(ErrorCode.UNAUTHORIZED_GUEST));

        request.setAttribute(GUEST_ID_ATTRIBUTE, guestId);
        return true;
    }
}
