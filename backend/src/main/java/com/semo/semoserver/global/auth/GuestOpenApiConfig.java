package com.semo.semoserver.global.auth;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger에서 오른쪽 위 Authorize 버튼에 게스트 키를 한 번 넣으면
 * 모든 요청에 X-Guest-Key 헤더가 붙도록 설정.
 */
@Configuration
public class GuestOpenApiConfig {

    private static final String SCHEME_NAME = "GuestKey";

    static {
        SpringDocUtils.getConfig().addAnnotationsToIgnore(CurrentGuest.class);
    }

    @Bean
    public OpenApiCustomizer guestKeyOpenApiCustomizer() {
        return openApi -> {
            if (openApi.getComponents() == null) {
                openApi.setComponents(new Components());
            }
            openApi.getComponents().addSecuritySchemes(SCHEME_NAME, new SecurityScheme()
                    .type(SecurityScheme.Type.APIKEY)
                    .in(SecurityScheme.In.HEADER)
                    .name(GuestAuthInterceptor.GUEST_KEY_HEADER));
            openApi.addSecurityItem(new SecurityRequirement().addList(SCHEME_NAME));
        };
    }
}
