package com.semo.semoserver.upload.service;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * 같은 Moment로 묶는 기준: 촬영 시각 10분 이내 + 거리 200m 이내
 */
public final class MatchRules {

    public static final Duration TIME_GAP = Duration.ofMinutes(10);
    public static final double MAX_DISTANCE_METERS = 200;

    private static final double EARTH_RADIUS_METERS = 6_371_000;

    private MatchRules() {
    }

    // Moment 시간 범위와 촬영 시각 사이의 간격(초). 범위 안이면 0
    public static long gapSeconds(LocalDateTime start, LocalDateTime end, LocalDateTime t) {
        if (!t.isBefore(start) && !t.isAfter(end)) {
            return 0;
        }
        if (t.isBefore(start)) {
            return Duration.between(t, start).toSeconds();
        }
        return Duration.between(end, t).toSeconds();
    }

    public static boolean withinTime(LocalDateTime start, LocalDateTime end, LocalDateTime t) {
        return gapSeconds(start, end, t) <= TIME_GAP.toSeconds();
    }

    // 두 지점 사이 거리(m), 하버사인 공식
    public static double distanceMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return 2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}