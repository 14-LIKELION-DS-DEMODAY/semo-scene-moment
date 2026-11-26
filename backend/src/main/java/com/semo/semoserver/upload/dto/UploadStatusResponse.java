package com.semo.semoserver.upload.dto;

import com.semo.semoserver.upload.entity.AnalysisStep;
import com.semo.semoserver.upload.entity.UploadBatch;
import com.semo.semoserver.upload.entity.UploadStatus;

public record UploadStatusResponse(
        Long uploadId,
        UploadStatus status,
        AnalysisStep step,
        int totalCount,
        int successCount,
        int failCount,
        int newMomentCount,
        int addedPhotoCount
) {
    public static UploadStatusResponse from(UploadBatch batch) {
        return new UploadStatusResponse(
                batch.getId(),
                batch.getStatus(),
                batch.getStep(),
                batch.getTotalCount(),
                batch.getSuccessCount(),
                batch.getFailCount(),
                batch.getNewMomentCount(),
                batch.getAddedPhotoCount());
    }
}