package com.semo.semoserver.global.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * 로컬에 저장한 이미지를 http://localhost:8080/files/** 로 볼 수 있게 열어 준다.
 * (/api/** 가 아니라서 게스트 키 없이 열림)
 */
@Configuration
public class LocalFileConfig implements WebMvcConfigurer {

    @Value("${semo.storage.local-dir:./uploads}")
    private String localDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(localDir).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/files/**")
                .addResourceLocations(location.endsWith("/") ? location : location + "/");
    }
}
