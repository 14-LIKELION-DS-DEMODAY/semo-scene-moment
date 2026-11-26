package com.semo.semoserver.upload.service;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.global.image.ImageSanitizer;
import com.semo.semoserver.global.storage.FileStorage;
import com.semo.semoserver.moment.dto.MomentCount;
import com.semo.semoserver.moment.dto.MomentListItem;
import com.semo.semoserver.moment.entity.Moment;
import com.semo.semoserver.moment.repository.MomentQueryRepository;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.participant.service.SemoAccessChecker;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.entity.PhotoMatchStatus;
import com.semo.semoserver.photo.repository.PhotoQueryRepository;
import com.semo.semoserver.semo.entity.Semo;
import com.semo.semoserver.semo.repository.SemoRepository;
import com.semo.semoserver.upload.dto.PhotoUploadResponse;
import com.semo.semoserver.upload.dto.UploadResultResponse;
import com.semo.semoserver.upload.dto.UploadStartResponse;
import com.semo.semoserver.upload.dto.UploadStatusResponse;
import com.semo.semoserver.upload.entity.AnalysisStep;
import com.semo.semoserver.upload.entity.UploadBatch;
import com.semo.semoserver.upload.repository.UploadBatchRepository;
import com.semo.semoserver.upload.repository.UploadPhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UploadService {

    private static final List<PhotoMatchStatus> REVIEW_STATUSES =
            List.of(PhotoMatchStatus.NEEDS_REVIEW, PhotoMatchStatus.UNCLASSIFIED);

    private final SemoRepository semoRepository;
    private final SemoAccessChecker accessChecker;
    private final UploadBatchRepository uploadBatchRepository;
    private final UploadPhotoRepository uploadPhotoRepository;
    private final PhotoQueryRepository photoQueryRepository;
    private final MomentQueryRepository momentRepository;
    private final ImageSanitizer imageSanitizer;
    private final PhotoMetadataReader metadataReader;
    private final FileStorage fileStorage;
    private final MomentMatcher momentMatcher;

    // 1. 업로드 시작
    @Transactional
    public UploadStartResponse start(Long guestId, Long semoId, int totalCount) {
        Semo semo = semoRepository.findById(semoId)
                .orElseThrow(() -> new CustomException(ErrorCode.SEMO_NOT_FOUND));
        Participant me = accessChecker.getMyParticipant(semoId, guestId);
        UploadBatch batch = uploadBatchRepository.save(UploadBatch.create(semo, me, totalCount));
        return new UploadStartResponse(batch.getId());
    }

    // 2. 사진 1장 저장: 원본에서 촬영 정보 읽기 → 메타데이터 지운 사본 저장
    //    실패해도 실패 개수는 남도록 CustomException은 롤백하지 않음
    @Transactional(noRollbackFor = CustomException.class)
    public PhotoUploadResponse uploadPhoto(Long guestId, Long uploadId, MultipartFile file) {
        UploadBatch batch = getMyBatch(guestId, uploadId);
        if (!batch.isUploading()) {
            throw new CustomException(ErrorCode.UPLOAD_NOT_IN_PROGRESS);
        }
        if (batch.getSuccessCount() >= batch.getTotalCount()) {
            throw new CustomException(ErrorCode.TOO_MANY_FILES);
        }
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        try {
            PhotoMetadataReader.PhotoMetadata meta = metadataReader.read(file.getBytes());
            ImageSanitizer.SanitizedImage clean = imageSanitizer.stripMetadata(file);
            int[] size = metadataReader.readSize(clean.bytes());
            String key = fileStorage.upload(clean.bytes(), "photos/" + batch.getSemo().getId(), clean.extension());

            Photo photo = uploadPhotoRepository.save(Photo.upload(
                    batch.getSemo(), batch.getParticipant(), batch,
                    key, originalName(file), clean.contentType(),
                    size[0], size[1], meta.takenAt(), meta.latitude(), meta.longitude()));

            batch.increaseSuccess();
            return new PhotoUploadResponse(photo.getId(), batch.getSuccessCount(), batch.getFailCount());
        } catch (CustomException e) {
            batch.increaseFail();
            throw e;
        } catch (IOException e) {
            batch.increaseFail();
            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE);
        }
    }

    // 3. 업로드 완료 → 분석 (1차 버전: 요청 안에서 바로 처리)
    @Transactional
    public UploadStatusResponse complete(Long guestId, Long uploadId) {
        UploadBatch batch = getMyBatch(guestId, uploadId);
        if (!batch.isUploading()) {
            return UploadStatusResponse.from(batch); // 이미 완료 요청된 업로드
        }
        if (batch.getSuccessCount() == 0) {
            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        batch.startAnalysis();
        batch.changeStep(AnalysisStep.MATCHING);
        MomentMatcher.MatchResult result = momentMatcher.match(batch);
        batch.changeStep(AnalysisStep.BUILDING);
        batch.complete(result.newMomentCount(), result.addedPhotoCount());
        batch.getSemo().touchActivity();
        return UploadStatusResponse.from(batch);
    }

    // 4. 분석 상태 조회
    public UploadStatusResponse getStatus(Long guestId, Long uploadId) {
        return UploadStatusResponse.from(getMyBatch(guestId, uploadId));
    }

    // 5. 매칭 결과
    public UploadResultResponse getResult(Long guestId, Long uploadId) {
        UploadBatch batch = getMyBatch(guestId, uploadId);
        Long semoId = batch.getSemo().getId();

        Map<Long, Long> participantCounts = photoQueryRepository.countParticipantsByMoment(semoId).stream()
                .collect(Collectors.toMap(MomentCount::momentId, MomentCount::count));

        List<MomentListItem> moments = momentRepository.findAllById(uploadPhotoRepository.findMomentIdsByBatch(batch.getId()))
                .stream()
                .sorted(Comparator.comparing(Moment::getStartAt))
                .map(m -> new MomentListItem(
                        m.getId(),
                        m.getName(),
                        m.getStartAt(),
                        m.getPhotoCount(),
                        participantCounts.getOrDefault(m.getId(), 0L),
                        m.getRepresentativePhoto() == null ? null
                                : fileStorage.getUrl(m.getRepresentativePhoto().getStorageKey())))
                .toList();

        long reviewCount = uploadPhotoRepository.countByUploadBatch_IdAndMatchStatusIn(batch.getId(), REVIEW_STATUSES);
        return new UploadResultResponse(batch.getNewMomentCount(), batch.getSuccessCount(), reviewCount, moments);
    }

    // 내가 시작한 업로드만
    private UploadBatch getMyBatch(Long guestId, Long uploadId) {
        UploadBatch batch = uploadBatchRepository.findById(uploadId)
                .orElseThrow(() -> new CustomException(ErrorCode.UPLOAD_NOT_FOUND));
        Participant me = accessChecker.getMyParticipant(batch.getSemo().getId(), guestId);
        if (!batch.getParticipant().getId().equals(me.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
        return batch;
    }

    private String originalName(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null || name.isBlank()) {
            return "photo";
        }
        return name.length() > 255 ? name.substring(name.length() - 255) : name;
    }
}