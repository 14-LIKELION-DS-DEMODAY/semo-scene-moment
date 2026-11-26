package com.semo.semoserver.photo.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PhotoDetailResponse(
        Long photoId,
        Long momentId,
        String imageUrl,
        String downloadUrl,
        Integer width,
        Integer height,
        LocalDateTime takenAt,
        UploaderSummary uploader,
        boolean isMine,
        long likeCount,
        boolean liked,
        long commentCount,
        List<RecentComment> recentComments,
        Long prevPhotoId,
        Long nextPhotoId
) {
}
