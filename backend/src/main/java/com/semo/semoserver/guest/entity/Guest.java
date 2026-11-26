package com.semo.semoserver.guest.entity;

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

import java.util.UUID;

@Entity
@Table(name = "guest")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Guest extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // X-Guest-Key 헤더로 보내는 값
    @Column(name = "guest_key", nullable = false, unique = true, length = 36)
    private String guestKey;

    // 기본 닉네임
    @Column(name = "default_nickname", length = 10)
    private String defaultNickname;

    public static Guest create() {
        Guest guest = new Guest();
        guest.guestKey = UUID.randomUUID().toString();
        return guest;
    }

    public void changeDefaultNickname(String nickname) {
        this.defaultNickname = nickname;
    }

    // 기본 닉네임이 없을 때만 저장
    public void setDefaultNicknameIfAbsent(String nickname) {
        if (this.defaultNickname == null) {
            this.defaultNickname = nickname;
        }
    }
}
