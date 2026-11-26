package com.semo.semoserver.comment.dto;

import com.semo.semoserver.comment.entity.Comment;

import java.time.LocalDateTime;

public record CommentResponse(
        Long commentId,
        Long participantId,
        String nickname,
        String content,
        LocalDateTime createdAt
) {
    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getParticipant().getId(),
                comment.getParticipant().getNickname(),
                comment.getContent(),
                comment.getCreatedAt());
    }
}
