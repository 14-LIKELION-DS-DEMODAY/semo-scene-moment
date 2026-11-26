package com.semo.semoserver.upload.dto;

import com.semo.semoserver.moment.dto.MomentListItem;

import java.util.List;

public record UploadResultResponse(
        int newMomentCount,
        int analyzedPhotoCount,
        long reviewPhotoCount,
        List<MomentListItem> moments
) {
}