package com.semo.semoserver.upload.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * 사진 분석을 백그라운드에서 돌리는 설정.
 * 같은 세모 분석이 동시에 돌면 Moment가 겹쳐 생길 수 있어서 한 번에 하나씩 처리한다.
 */
@Configuration
@EnableAsync
public class AnalysisAsyncConfig {

    public static final String EXECUTOR = "analysisExecutor";

    @Bean(name = EXECUTOR)
    public ThreadPoolTaskExecutor analysisExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(1);
        executor.setMaxPoolSize(1);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("analysis-");
        return executor;
    }
}
