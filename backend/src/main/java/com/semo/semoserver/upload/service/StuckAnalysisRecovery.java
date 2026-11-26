package com.semo.semoserver.upload.service;

import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.upload.entity.UploadBatch;
import com.semo.semoserver.upload.entity.UploadStatus;
import com.semo.semoserver.upload.repository.UploadBatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 분석 도중 서버가 꺼지면 ANALYZING에서 멈춘다.
 * 서버가 켜질 때 그런 업로드를 FAILED로 바꿔서 다시 시도할 수 있게 한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class StuckAnalysisRecovery {

    private final UploadBatchRepository uploadBatchRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void failStuckAnalyses() {
        List<UploadBatch> stuck = uploadBatchRepository.findAllByStatus(UploadStatus.ANALYZING);
        stuck.forEach(b -> b.fail(ErrorCode.ANALYSIS_FAILED.getMessage()));
        if (!stuck.isEmpty()) {
            log.warn("marked {} stuck analyses as FAILED", stuck.size());
        }
    }
}