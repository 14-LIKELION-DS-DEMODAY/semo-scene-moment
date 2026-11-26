package com.semo.semoserver.upload.dto;

public record PhotoUploadResponse(Long photoId, int successCount, int failCount) {
}