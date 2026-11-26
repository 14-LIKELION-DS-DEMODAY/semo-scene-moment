package com.semo.semoserver.moment.dto;

import java.time.LocalDateTime;
import java.util.List;

public record MomentDetailResponse(
        Long momentId,
        String name,
        LocalDateTime startAt,
        LocalDateTime endAt,
        int photoCount,
        String representativePhotoUrl,
        List<PhotographerSummary> photographers,
        List<MomentPhotoItem> photos
) {
}
