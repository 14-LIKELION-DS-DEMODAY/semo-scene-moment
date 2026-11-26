package com.semo.semoserver.comment.repository;

import com.semo.semoserver.comment.entity.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    long countByPhoto_Id(Long photoId);

    // 오래된 순
    @Query("select c from Comment c join fetch c.participant "
            + "where c.photo.id = :photoId order by c.createdAt asc, c.id asc")
    List<Comment> findAllByPhotoIdOldestFirst(@Param("photoId") Long photoId);

    // 최신 n개
    @Query("select c from Comment c join fetch c.participant "
            + "where c.photo.id = :photoId order by c.createdAt desc, c.id desc")
    List<Comment> findLatestByPhotoId(@Param("photoId") Long photoId, Pageable pageable);

    // 사진 삭제 전에 그 사진의 댓글을 모두 지움
    @Modifying(flushAutomatically = true)
    @Query("delete from Comment c where c.photo.id = :photoId")
    int deleteAllByPhotoId(@Param("photoId") Long photoId);
}
