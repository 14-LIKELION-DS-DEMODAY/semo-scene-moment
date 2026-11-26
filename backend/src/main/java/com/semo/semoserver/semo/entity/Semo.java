package com.semo.semoserver.semo.entity;

import com.semo.semoserver.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "seomo")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Seomo extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 30)
    private String name;

    // 대표 사진 저장소
    @Column(name = "cover_image_key", length = 500)
    private String coverImageKey;

    // 초대 코드
    @Column(name = "invite_code", nullable = false, unique = true, length = 8)
    private String inviteCode;

    // 활동순 정렬 기준
    @Column(name = "last_activity_at", nullable = false)
    private LocalDateTime lastActivityAt;

    // 중복 생성 방지용
    @Column(name = "create_request_id", unique = true, length = 36)
    private String createRequestId;

    public static Seomo create(String name, String inviteCode, String createRequestId) {
        Seomo seomo = new Seomo();
        seomo.name = name;
        seomo.inviteCode = inviteCode;
        seomo.createRequestId = createRequestId;
        seomo.lastActivityAt = LocalDateTime.now();
        return seomo;
    }

    public void changeCoverImageKey(String coverImageKey) {
        this.coverImageKey = coverImageKey;
    }

    // 참여, 사진 업로드, 댓글이 생길 때 호출
    public void touchActivity() {
        this.lastActivityAt = LocalDateTime.now();
    }
}