package com.semo.semoserver.moment.dto;

import java.time.LocalDateTime;

public record MomentPhotoItem(
        Long photoId,
        String thumbnailUrl,
        Long participantId,
        String nickname,
        LocalDateTime takenAt
) {
}
