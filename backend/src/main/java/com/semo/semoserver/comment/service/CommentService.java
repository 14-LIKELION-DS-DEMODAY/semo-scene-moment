package com.semo.semoserver.comment.service;

import com.semo.semoserver.comment.dto.CommentResponse;
import com.semo.semoserver.comment.entity.Comment;
import com.semo.semoserver.comment.repository.CommentRepository;
import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.participant.service.SemoAccessChecker;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.photo.repository.PhotoQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PhotoQueryRepository photoRepository;
    private final SemoAccessChecker accessChecker;

    // 댓글 모두 보기
    public List<CommentResponse> getComments(Long guestId, Long photoId) {
        Photo photo = getPhoto(photoId);
        accessChecker.getMyParticipant(photo.getSemo().getId(), guestId);
        return commentRepository.findAllByPhotoIdOldestFirst(photoId).stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Transactional
    public CommentResponse create(Long guestId, Long photoId, String content) {
        Photo photo = getPhoto(photoId);
        Participant me = accessChecker.getMyParticipant(photo.getSemo().getId(), guestId);

        Comment comment = commentRepository.saveAndFlush(Comment.create(photo, me, content.strip()));
        photo.getSemo().touchActivity();

        return CommentResponse.from(comment);
    }

    private Photo getPhoto(Long photoId) {
        return photoRepository.findDetailById(photoId)
                .orElseThrow(() -> new CustomException(ErrorCode.PHOTO_NOT_FOUND));
    }
}
