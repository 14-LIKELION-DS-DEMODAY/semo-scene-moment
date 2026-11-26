package com.semo.semoserver.photo.entity;

import com.semo.semoserver.global.entity.BaseTimeEntity;
import com.semo.semoserver.moment.entity.Moment;
import com.semo.semoserver.participant.entity.Participant;
import com.semo.semoserver.seomo.entity.Seomo;
import com.semo.semoserver.upload.entity.UploadBatch;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "photo")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Photo extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "seomo_id", nullable = false)
    private Seomo seomo;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "participant_id", nullable = false)
    private Participant participant;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "upload_batch_id", nullable = false)
    private UploadBatch uploadBatch;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "moment_id")
    private Moment moment;
    @Column(name = "storage_key", nullable = false, length = 500) private String storageKey;
    @Column(name = "original_filename", nullable = false) private String originalFilename;
    @Column(name = "content_type", nullable = false, length = 50) private String contentType;
    private Integer width;
    private Integer height;
    @Column(name = "taken_at") private LocalDateTime takenAt;
    @Column(precision = 9, scale = 6) private BigDecimal latitude;
    @Column(precision = 9, scale = 6) private BigDecimal longitude;
    @Enumerated(EnumType.STRING) @Column(name = "match_status", nullable = false)
    private PhotoMatchStatus matchStatus;

    public static Photo create(Seomo seomo, Participant participant, UploadBatch batch, Moment moment,
                               String storageKey, LocalDateTime takenAt, PhotoMatchStatus status) {
        Photo p = new Photo(); p.seomo = seomo; p.participant = participant; p.uploadBatch = batch; p.moment = moment;
        p.storageKey = storageKey; p.originalFilename = "a.jpg"; p.contentType = "image/jpeg";
        p.width = 3024; p.height = 4032; p.takenAt = takenAt; p.matchStatus = status;
        p.latitude = new BigDecimal("35.158700"); p.longitude = new BigDecimal("129.160400");
        return p;
    }

    public void changeMoment(Moment moment) {
        this.moment = moment;
        this.matchStatus = PhotoMatchStatus.MATCHED;
    }
}