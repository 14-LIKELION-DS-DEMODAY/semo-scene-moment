package com.semo.semoserver.home.dto;

import java.time.LocalDateTime;

public record SemoPhotoStat(Long semoId, Long photoCount, LocalDateTime firstTakenAt) {
}
