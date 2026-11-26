package com.semo.semoserver.participant.entity;

import com.semo.semoserver.global.entity.BaseTimeEntity;
import com.semo.semoserver.guest.entity.Guest;
import com.semo.semoserver.semo.entity.Semo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
        name = "participant",
        uniqueConstraints = {
                // 두 번 참여 방지
                @UniqueConstraint(name = "uk_participant_semo_guest", columnNames = {"semo_id", "guest_id"}),
                // 닉네임 중복 금지
                @UniqueConstraint(name = "uk_participant_semo_nickname", columnNames = {"semo_id", "nickname"})
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Participant extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semo_id", nullable = false)
    private Semo semo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    // 세모에서 쓰는 닉네임
    @Column(name = "nickname", nullable = false, length = 10)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private ParticipantRole role;

    // 이어서 보기
    @Column(name = "last_viewed_at")
    private LocalDateTime lastViewedAt;

    public static Participant create(Semo semo, Guest guest, String nickname, ParticipantRole role) {
        Participant participant = new Participant();
        participant.semo = semo;
        participant.guest = guest;
        participant.nickname = nickname;
        participant.role = role;
        return participant;
    }

    public boolean isOwner() {
        return role == ParticipantRole.OWNER;
    }

    public void markViewed() {
        this.lastViewedAt = LocalDateTime.now();
    }
}
