package com.semo.semoserver.moment.service;

import com.semo.semoserver.moment.entity.Moment;
import com.semo.semoserver.moment.repository.MomentQueryRepository;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.repository.PhotoQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * 사진이 추가·삭제·이동된 뒤 Moment를 다시 계산한다.
 * 사진 수, 시작·끝 시각, 중심 위치, 대표 사진을 갱신하고,
 * 사진이 0장이면 Moment를 지운다.
 */
@Component
@RequiredArgsConstructor
public class MomentRecalculator {

    private final MomentQueryRepository momentRepository;
    private final PhotoQueryRepository photoRepository;

    @Transactional
    public void recalculate(Long momentId) {
        Moment moment = momentRepository.findById(momentId).orElse(null);
        if (moment == null) {
            return;
        }

        List<Photo> photos = photoRepository.findMomentPhotos(momentId);

        // 사진이 없으면 Moment 삭제
        if (photos.isEmpty()) {
            moment.changeRepresentativePhoto(null);
            momentRepository.delete(moment);
            momentRepository.flush();
            return;
        }

        // 시작·끝 시각: 촬영 시각이 있는 사진 기준. 하나도 없으면 기존 값 유지
        List<LocalDateTime> times = photos.stream()
                .map(Photo::getTakenAt)
                .filter(Objects::nonNull)
                .sorted()
                .toList();
        LocalDateTime startAt = times.isEmpty() ? moment.getStartAt() : times.get(0);
        LocalDateTime endAt = times.isEmpty() ? moment.getEndAt() : times.get(times.size() - 1);

        // 중심 위치: GPS가 있는 사진의 평균. 없으면 null
        List<Photo> located = photos.stream()
                .filter(p -> p.getLatitude() != null && p.getLongitude() != null)
                .toList();
        BigDecimal centerLat = average(located.stream().map(Photo::getLatitude).toList());
        BigDecimal centerLng = average(located.stream().map(Photo::getLongitude).toList());

        moment.refresh(startAt, endAt, centerLat, centerLng, photos.size());

        // 대표 사진: 지금 대표 사진이 이 Moment에 없으면 가장 먼저 찍은 사진으로
        Photo current = moment.getRepresentativePhoto();
        boolean stillHere = current != null
                && photos.stream().anyMatch(p -> p.getId().equals(current.getId()));
        if (!stillHere) {
            Photo first = photos.stream()
                    .filter(p -> p.getTakenAt() != null)
                    .findFirst()
                    .orElse(photos.get(0));
            moment.changeRepresentativePhoto(first);
        }
    }

    private BigDecimal average(List<BigDecimal> values) {
        if (values.isEmpty()) {
            return null;
        }
        BigDecimal sum = values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(values.size()), 6, RoundingMode.HALF_UP);
    }
}