package com.semo.semoserver.review.dto;

// momentId 또는 newMoment=true 중 하나만 보냄
public record AssignRequest(Long momentId, Boolean newMoment) {
}
