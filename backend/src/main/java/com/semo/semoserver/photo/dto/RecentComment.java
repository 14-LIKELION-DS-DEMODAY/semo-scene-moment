package com.semo.semoserver.photo.dto;

import java.time.LocalDateTime;

public record RecentComment(Long commentId, String nickname, String content, LocalDateTime createdAt) {
}
