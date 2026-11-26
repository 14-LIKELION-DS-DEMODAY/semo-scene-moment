package com.semo.semoserver.global.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class GuestAuthConfig implements WebMvcConfigurer {

    private final GuestAuthInterceptor guestAuthInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(guestAuthInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/guests",          // POST 게스트 키 발급
                        "/api/invites/*/qr"     // QR 이미지
                );
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new CurrentGuestArgumentResolver());
    }
}
