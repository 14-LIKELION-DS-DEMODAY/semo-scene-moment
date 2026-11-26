package com.semo.semoserver.upload.service;

import com.semo.semoserver.upload.config.AnalysisAsyncConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 분석을 백그라운드에서 실행한다. 실패하면 FAILED로 남겨서 다시 시도할 수 있게 한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AnalysisRunner {

    private final AnalysisWorker worker;

    @Async(AnalysisAsyncConfig.EXECUTOR)
    public void run(Long batchId) {
        try {
            if (!worker.moveToMatching(batchId)) {
                return;
            }
            worker.analyze(batchId);
        } catch (RuntimeException e) {
            log.error("analysis failed. uploadId={}", batchId, e);
            worker.markFailed(batchId);
        }
    }
}