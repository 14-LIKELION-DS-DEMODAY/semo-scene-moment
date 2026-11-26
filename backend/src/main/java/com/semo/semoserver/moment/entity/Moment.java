package com.semo.semoserver.moment.entity;

import com.semo.semoserver.global.entity.BaseTimeEntity;
import com.semo.semoserver.photo.entity.Photo;
import com.semo.semoserver.semo.entity.Semo;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "moment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Moment extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "semo_id", nullable = false)
    private Semo semo;
    @Column(nullable = false, length = 30) private String name;
    @Column(name = "start_at", nullable = false) private LocalDateTime startAt;
    @Column(name = "end_at", nullable = false) private LocalDateTime endAt;
    @Column(name = "center_latitude", precision = 9, scale = 6) private BigDecimal centerLatitude;
    @Column(name = "center_longitude", precision = 9, scale = 6) private BigDecimal centerLongitude;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "representative_photo_id")
    private Photo representativePhoto;
    @Column(name = "photo_count", nullable = false) private int photoCount;

    public static Moment create(Semo semo, String name, LocalDateTime startAt, LocalDateTime endAt, int photoCount) {
        Moment m = new Moment(); m.semo = semo; m.name = name; m.startAt = startAt; m.endAt = endAt; m.photoCount = photoCount; return m;
    }

    public void changeName(String name) { this.name = name; }

    public void changeRepresentativePhoto(Photo photo) { this.representativePhoto = photo; }

    public void changePhotoCount(int photoCount) { this.photoCount = photoCount; }
}
