package com.semo.semoserver.review.dto;

import com.semo.semoserver.moment.dto.MomentListItem;

import java.time.LocalDateTime;
import java.util.List;

public record ReviewPhotoItem(
        Long photoId,
        String imageUrl,
        LocalDateTime takenAt,
        List<MomentListItem> candidates
) {
}