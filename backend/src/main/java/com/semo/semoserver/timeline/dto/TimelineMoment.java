package com.semo.semoserver.timeline.dto;

import java.time.LocalDateTime;

public record TimelineMoment(
        Long momentId,
        String name,
        LocalDateTime startAt,
        LocalDateTime endAt,
        int photoCount,
        long participantCount,
        double waveHeight,
        String representativePhotoUrl
) {
}