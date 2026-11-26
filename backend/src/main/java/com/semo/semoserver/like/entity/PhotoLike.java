package com.semo.semoserver.like.entity;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "photo_like",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_photo_like_photo_participant", columnNames = {"photo_id", "participant_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PhotoLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public static PhotoLike create(Photo photo, Participant participant) {
        PhotoLike like = new PhotoLike();
        like.photo = photo;
        like.participant = participant;
        like.createdAt = LocalDateTime.now();
        return like;
    }
}
