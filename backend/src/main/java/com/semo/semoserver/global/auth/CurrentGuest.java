package com.semo.semoserver.global.auth;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 컨트롤러 파라미터에 붙이면 X-Guest-Key로 확인된 게스트의 id(Long)가 들어온다.
 * 예: public ApiResponse<...> me(@CurrentGuest Long guestId)
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentGuest {
}
