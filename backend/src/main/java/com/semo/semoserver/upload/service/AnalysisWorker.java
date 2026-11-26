package com.semo.semoserver.upload.service;

import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.upload.entity.AnalysisStep;
import com.semo.semoserver.upload.entity.UploadBatch;
import com.semo.semoserver.upload.entity.UploadStatus;
import com.semo.semoserver.upload.repository.UploadBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 분석 단계마다 트랜잭션을 따로 나눠서,
 * 단계 변경은 바로 보이고 분석이 실패해도 FAILED는 남게 한다.
 */
@Component
@RequiredArgsConstructor
public class AnalysisWorker {

    private final UploadBatchRepository uploadBatchRepository;
    private final MomentMatcher momentMatcher;

    // 분석 중인 업로드면 MATCHING 단계로 (아니면 false → 분석 안 함)
    @Transactional
    public boolean moveToMatching(Long batchId) {
        return uploadBatchRepository.findById(batchId)
                .filter(b -> b.getStatus() == UploadStatus.ANALYZING)
                .map(b -> {
                    b.changeStep(AnalysisStep.MATCHING);
                    return true;
                })
                .orElse(false);
    }

    // 매칭 → 완료
    @Transactional
    public void analyze(Long batchId) {
        UploadBatch batch = uploadBatchRepository.findById(batchId).orElse(null);
        if (batch == null || batch.getStatus() != UploadStatus.ANALYZING) {
            return;
        }
        MomentMatcher.MatchResult result = momentMatcher.match(batch);
        batch.changeStep(AnalysisStep.BUILDING);
        batch.complete(result.newMomentCount(), result.addedPhotoCount());
        batch.getSemo().touchActivity();
    }

    // 분석 트랜잭션이 롤백된 뒤 따로 FAILED 저장
    @Transactional
    public void markFailed(Long batchId) {
        uploadBatchRepository.findById(batchId)
                .filter(b -> b.getStatus() == UploadStatus.ANALYZING)
                .ifPresent(b -> b.fail(ErrorCode.ANALYSIS_FAILED.getMessage()));
    }
}
