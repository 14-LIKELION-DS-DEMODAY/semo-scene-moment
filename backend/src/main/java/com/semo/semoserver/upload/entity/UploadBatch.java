package com.semo.semoserver.upload.entity;

import com.semo.semoserver.global.entity.BaseTimeEntity;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.semo.entity.Semo;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "upload_batch")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UploadBatch extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semo_id", nullable = false)
    private Semo semo;

    // 올린 사람
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private UploadStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "step", length = 20)
    private AnalysisStep step;

    @Column(name = "total_count", nullable = false)
    private int totalCount;

    @Column(name = "success_count", nullable = false)
    private int successCount;

    @Column(name = "fail_count", nullable = false)
    private int failCount;

    // 결과 요약: 새 Moment 수
    @Column(name = "new_moment_count", nullable = false)
    private int newMomentCount;

    // 결과 요약: 기존 Moment에 추가된 사진 수
    @Column(name = "added_photo_count", nullable = false)
    private int addedPhotoCount;

    @Column(name = "error_message")
    private String errorMessage;

    public static UploadBatch create(Semo semo, Participant participant, int totalCount) {
        UploadBatch batch = new UploadBatch();
        batch.semo = semo;
        batch.participant = participant;
        batch.totalCount = totalCount;
        batch.status = UploadStatus.UPLOADING;
        return batch;
    }

    public void increaseSuccess() {
        this.successCount++;
    }

    public void increaseFail() {
        this.failCount++;
    }

    public void startAnalysis() {
        this.status = UploadStatus.ANALYZING;
        this.step = AnalysisStep.EXTRACTING;
        this.errorMessage = null;
    }

    public void changeStep(AnalysisStep step) {
        this.step = step;
    }

    public void complete(int newMomentCount, int addedPhotoCount) {
        this.status = UploadStatus.COMPLETED;
        this.step = null;
        this.newMomentCount = newMomentCount;
        this.addedPhotoCount = addedPhotoCount;
    }

    public void fail(String errorMessage) {
        this.status = UploadStatus.FAILED;
        this.errorMessage = errorMessage;
    }

    public void cancel() {
        this.status = UploadStatus.CANCELED;
        this.step = null;
    }

    public boolean isUploading() {
        return status == UploadStatus.UPLOADING;
    }

    public boolean isFailed() {
        return status == UploadStatus.FAILED;
    }

    public boolean isCanceled() {
        return status == UploadStatus.CANCELED;
    }

    // 취소는 업로드 중이거나 실패한 경우만
    public boolean canCancel() {
        return status == UploadStatus.UPLOADING || status == UploadStatus.FAILED;
    }

    // 다시 시도 전에 업로드 중 상태로 되돌림
    public void reopen() {
        this.status = UploadStatus.UPLOADING;
        this.step = null;
        this.errorMessage = null;
    }
}