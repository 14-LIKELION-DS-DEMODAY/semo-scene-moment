package com.semo.semoserver.comment.entity;

import com.semo.semoserver.global.entity.BaseTimeEntity;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.photo.entity.Photo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @Column(name = "content", nullable = false, length = 500)
    private String content;

    public static Comment create(Photo photo, Participant participant, String content) {
        Comment comment = new Comment();
        comment.photo = photo;
        comment.participant = participant;
        comment.content = content;
        return comment;
    }
}
