package com.semo.semoserver.timeline.service;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.global.storage.FileStorage;
import com.semo.semoserver.moment.dto.MomentCount;
import com.semo.semoserver.moment.entity.Moment;
import com.semo.semoserver.moment.repository.MomentQueryRepository;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.participant.service.SemoAccessChecker;
import com.semo.semoserver.photo.entity.PhotoMatchStatus;
import com.semo.semoserver.photo.repository.PhotoQueryRepository;
import com.semo.semoserver.semo.entity.Semo;
import com.semo.semoserver.semo.repository.SemoRepository;
import com.semo.semoserver.timeline.dto.TimelineMoment;
import com.semo.semoserver.timeline.dto.TimelineResponse;
import com.semo.semoserver.timeline.repository.TimelinePhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimelineService {

    // 사진이 아주 적은 Moment도 파도가 보이도록 최소 높이
    private static final double MIN_WAVE_HEIGHT = 0.2;

    private final SemoRepository semoRepository;
    private final SemoAccessChecker accessChecker;
    private final MomentQueryRepository momentRepository;
    private final PhotoQueryRepository photoQueryRepository;
    private final TimelinePhotoRepository timelinePhotoRepository;
    private final FileStorage fileStorage;

    @Transactional
    public TimelineResponse getTimeline(Long guestId, Long semoId, LocalDate date) {
        Semo semo = semoRepository.findById(semoId)
                .orElseThrow(() -> new CustomException(ErrorCode.SEMO_NOT_FOUND));
        Participant me = accessChecker.getMyParticipant(semoId, guestId);
        me.markViewed(); // 이어서 보기(최근 열어봄) 기록

        List<Moment> allMoments = momentRepository.findAllBySemoId(semoId); // 시작 시각 순
        long undated = timelinePhotoRepository.countBySemo_IdAndMatchStatus(semoId, PhotoMatchStatus.UNCLASSIFIED);

        if (allMoments.isEmpty()) {
            return new TimelineResponse(semo.getId(), semo.getName(), List.of(), null, List.of(), undated, true);
        }

        // 날짜 칩: Moment 시작 날짜 목록
        List<LocalDate> dates = allMoments.stream()
                .map(m -> m.getStartAt().toLocalDate())
                .distinct()
                .sorted()
                .toList();
        LocalDate selected = (date != null && dates.contains(date)) ? date : dates.get(0);

        // 파형 높이는 세모 전체에서 사진이 가장 많은 Moment 기준 (날짜를 바꿔도 비교 가능하게)
        int maxCount = allMoments.stream().mapToInt(Moment::getPhotoCount).max().orElse(1);

        Map<Long, Long> participantCounts = photoQueryRepository.countParticipantsByMoment(semoId).stream()
                .collect(Collectors.toMap(MomentCount::momentId, MomentCount::count));

        List<TimelineMoment> moments = allMoments.stream()
                .filter(m -> m.getStartAt().toLocalDate().equals(selected))
                .map(m -> new TimelineMoment(
                        m.getId(),
                        m.getName(),
                        m.getStartAt(),
                        m.getEndAt(),
                        m.getPhotoCount(),
                        participantCounts.getOrDefault(m.getId(), 0L),
                        waveHeight(m.getPhotoCount(), maxCount),
                        m.getRepresentativePhoto() == null ? null
                                : fileStorage.getUrl(m.getRepresentativePhoto().getStorageKey())))
                .toList();

        return new TimelineResponse(semo.getId(), semo.getName(), dates, selected, moments, undated, false);
    }

    // 사진 수에 따라 0~1. 제곱근을 써서 사진이 많아져도 높이가 과하게 커지지 않게 함
    private double waveHeight(int photoCount, int maxCount) {
        if (maxCount <= 0) {
            return MIN_WAVE_HEIGHT;
        }
        double ratio = Math.sqrt(photoCount) / Math.sqrt(maxCount);
        double height = MIN_WAVE_HEIGHT + (1 - MIN_WAVE_HEIGHT) * ratio;
        return Math.round(Math.min(1.0, height) * 100) / 100.0;
    }
}