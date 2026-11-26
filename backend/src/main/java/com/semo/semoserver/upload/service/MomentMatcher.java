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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * 업로드한 사진을 Moment에 묶는다.
 * - 촬영 시각 없음 → 미분류
 * - GPS 없음 → 확인 필요 (사용자가 고름)
 * - 10분 이내 + 200m 이내 Moment가 1개 → 그 Moment에 넣음
 * - 그런 Moment가 2개 이상 → 확인 필요
 * - 없음 → 새 Moment
 */
@Component
@RequiredArgsConstructor
public class MomentMatcher {

    private final MomentQueryRepository momentRepository;
    private final UploadPhotoRepository uploadPhotoRepository;
    private final MomentRecalculator momentRecalculator;

    public record MatchResult(int newMomentCount, int addedPhotoCount) {
    }

    // 매칭 중 Moment의 시간 범위와 위치를 따로 들고 다님 (재계산은 마지막에 한 번)
    private static class Slot {
        private final Moment moment;
        private final boolean created;
        private LocalDateTime start;
        private LocalDateTime end;
        private double latSum;
        private double lngSum;
        private int located;

        Slot(Moment moment, boolean created, LocalDateTime start, LocalDateTime end) {
            this.moment = moment;
            this.created = created;
            this.start = start;
            this.end = end;
        }

        void addLocation(BigDecimal lat, BigDecimal lng) {
            if (lat != null && lng != null) {
                latSum += lat.doubleValue();
                lngSum += lng.doubleValue();
                located++;
            }
        }

        boolean hasLocation() {
            return located > 0;
        }

        double lat() {
            return latSum / located;
        }

        double lng() {
            return lngSum / located;
        }
    }

    @Transactional
    public MatchResult match(UploadBatch batch) {
        Semo semo = batch.getSemo();
        List<Photo> photos = uploadPhotoRepository.findBatchPhotos(batch.getId());

        List<Slot> slots = new ArrayList<>();
        for (Moment m : momentRepository.findAllBySemoId(semo.getId())) {
            Slot slot = new Slot(m, false, m.getStartAt(), m.getEndAt());
            slot.addLocation(m.getCenterLatitude(), m.getCenterLongitude());
            slots.add(slot);
        }

        int momentNumber = slots.size();
        int newMomentCount = 0;
        int addedPhotoCount = 0;
        Set<Long> touched = new LinkedHashSet<>();

        for (Photo photo : photos) {
            LocalDateTime t = photo.getTakenAt();
            boolean hasGps = photo.getLatitude() != null && photo.getLongitude() != null;

            // 촬영 시각 없음 → 미분류, GPS 없음 → 확인 필요
            if (t == null || !hasGps) {
                photo.markNeedsReview();
                continue;
            }

            double lat = photo.getLatitude().doubleValue();
            double lng = photo.getLongitude().doubleValue();

            // 10분 이내 + 200m 이내 (위치 정보가 없는 기존 Moment는 시간만 봄)
            List<Slot> candidates = slots.stream()
                    .filter(s -> MatchRules.withinTime(s.start, s.end, t))
                    .filter(s -> !s.hasLocation()
                            || MatchRules.distanceMeters(s.lat(), s.lng(), lat, lng) <= MatchRules.MAX_DISTANCE_METERS)
                    .toList();

            // 후보가 여러 개면 자동으로 정하지 않음
            if (candidates.size() > 1) {
                photo.markNeedsReview();
                continue;
            }

            Slot slot;
            if (candidates.isEmpty()) {
                momentNumber++;
                Moment created = momentRepository.save(Moment.create(semo, "Moment " + momentNumber, t, t, 0));
                slot = new Slot(created, true, t, t);
                slots.add(slot);
                newMomentCount++;
            } else {
                slot = candidates.get(0);
                if (t.isBefore(slot.start)) slot.start = t;
                if (t.isAfter(slot.end)) slot.end = t;
            }
            slot.addLocation(photo.getLatitude(), photo.getLongitude());

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
}
