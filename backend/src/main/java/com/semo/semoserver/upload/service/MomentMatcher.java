package com.semo.semoserver.upload.service;

import com.semo.semoserver.moment.entity.Moment;
import com.semo.semoserver.moment.repository.MomentQueryRepository;
import com.semo.semoserver.moment.service.MomentRecalculator;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.semo.entity.Semo;
import com.semo.semoserver.upload.entity.UploadBatch;
import com.semo.semoserver.upload.repository.UploadPhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * 업로드한 사진을 촬영 시각 기준(10분)으로 Moment에 묶는다.
 * - 기존 Moment 또는 이번에 만든 Moment의 시간 범위와 10분 이내면 그 Moment에 넣는다.
 * - 없으면 새 Moment를 만든다.
 * - 촬영 시각이 없는 사진은 미분류(UNCLASSIFIED)로 남긴다.
 * TODO: 200m 거리 조건, GPS 없는 사진 확인 필요 처리
 */
@Component
@RequiredArgsConstructor
public class MomentMatcher {

    private static final Duration GAP = Duration.ofMinutes(10);

    private final MomentQueryRepository momentRepository;
    private final UploadPhotoRepository uploadPhotoRepository;
    private final MomentRecalculator momentRecalculator;

    public record MatchResult(int newMomentCount, int addedPhotoCount) {
    }

    // 매칭 중 Moment의 시간 범위를 따로 들고 다님 (재계산은 마지막에 한 번)
    private static class Slot {
        private final Moment moment;
        private final boolean created;
        private LocalDateTime start;
        private LocalDateTime end;

        Slot(Moment moment, boolean created, LocalDateTime start, LocalDateTime end) {
            this.moment = moment;
            this.created = created;
            this.start = start;
            this.end = end;
        }
    }

    @Transactional
    public MatchResult match(UploadBatch batch) {
        Semo semo = batch.getSemo();
        List<Photo> photos = uploadPhotoRepository.findBatchPhotos(batch.getId());

        List<Slot> slots = new ArrayList<>();
        for (Moment m : momentRepository.findAllBySemoId(semo.getId())) {
            slots.add(new Slot(m, false, m.getStartAt(), m.getEndAt()));
        }

        int momentNumber = slots.size();
        int newMomentCount = 0;
        int addedPhotoCount = 0;
        Set<Long> touched = new LinkedHashSet<>();

        for (Photo photo : photos) {
            LocalDateTime t = photo.getTakenAt();
            if (t == null) {
                continue; // 미분류로 남김
            }

            Slot slot = findClosest(slots, t);
            if (slot == null) {
                momentNumber++;
                Moment created = momentRepository.save(Moment.create(semo, "Moment " + momentNumber, t, t, 0));
                slot = new Slot(created, true, t, t);
                slots.add(slot);
                newMomentCount++;
            } else {
                if (t.isBefore(slot.start)) slot.start = t;
                if (t.isAfter(slot.end)) slot.end = t;
            }

            photo.changeMoment(slot.moment);
            if (!slot.created) {
                addedPhotoCount++;
            }
            touched.add(slot.moment.getId());
        }

        uploadPhotoRepository.flush();
        for (Long momentId : touched) {
            momentRecalculator.recalculate(momentId);
        }
        return new MatchResult(newMomentCount, addedPhotoCount);
    }

    // 시간 범위와 10분 이내인 Moment 중 가장 가까운 것
    private Slot findClosest(List<Slot> slots, LocalDateTime t) {
        Slot best = null;
        long bestGap = Long.MAX_VALUE;
        for (Slot s : slots) {
            long gap;
            if (!t.isBefore(s.start) && !t.isAfter(s.end)) {
                gap = 0;
            } else if (t.isBefore(s.start)) {
                gap = Duration.between(t, s.start).toSeconds();
            } else {
                gap = Duration.between(s.end, t).toSeconds();
            }
            if (gap <= GAP.toSeconds() && gap < bestGap) {
                best = s;
                bestGap = gap;
            }
        }
        return best;
    }
}
