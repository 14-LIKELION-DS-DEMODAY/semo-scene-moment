package com.semo.semoserver.moment.dto;

import java.time.LocalDateTime;

public record MomentListItem(
        Long momentId,
        String name,
        LocalDateTime startAt,
        int photoCount,
        long participantCount,
        String thumbnailUrl
) {
}
