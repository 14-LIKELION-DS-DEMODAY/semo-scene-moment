package com.semo.semoserver.semo.dto;

public record SemoCreateResponse(
        Long semoId,
        String name,
        String inviteCode,
        String inviteUrl
) {
}
