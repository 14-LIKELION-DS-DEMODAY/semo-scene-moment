package com.semo.semoserver.upload.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.lang.GeoLocation;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;

/**
 * 원본 사진에서 촬영 시각, GPS를 읽는다.
 * 메타데이터를 지우기 전에 원본 바이트로 호출해야 한다.
 */
@Component
public class PhotoMetadataReader {

    private static final DateTimeFormatter EXIF_TIME = DateTimeFormatter.ofPattern("yyyy:MM:dd HH:mm:ss");

    public record PhotoMetadata(LocalDateTime takenAt, BigDecimal latitude, BigDecimal longitude) {
    }

    public PhotoMetadata read(byte[] original) {
        try {
            Metadata metadata = ImageMetadataReader.readMetadata(new ByteArrayInputStream(original));
            LocalDateTime takenAt = readTakenAt(metadata);
            GeoLocation location = readLocation(metadata);
            if (location == null) {
                return new PhotoMetadata(takenAt, null, null);
            }
            return new PhotoMetadata(takenAt, scale(location.getLatitude()), scale(location.getLongitude()));
        } catch (Exception e) {
            // 메타데이터를 못 읽으면 정보 없는 사진으로 처리 (미분류)
            return new PhotoMetadata(null, null, null);
        }
    }

    // 가로·세로 크기. 메타데이터를 지운(회전이 적용된) 이미지로 호출
    public int[] readSize(byte[] image) {
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(image))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) {
                return new int[]{0, 0};
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(in);
                return new int[]{reader.getWidth(0), reader.getHeight(0)};
            } finally {
                reader.dispose();
            }
        } catch (Exception e) {
            return new int[]{0, 0};
        }
    }

    // 촬영 시각: DateTimeOriginal, 없으면 DateTime. 사진에 시간대 정보가 없어 그대로 한국 시간으로 본다
    private LocalDateTime readTakenAt(Metadata metadata) {
        ExifSubIFDDirectory sub = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        String raw = sub == null ? null : sub.getString(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL);
        if (raw == null) {
            ExifIFD0Directory ifd0 = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            raw = ifd0 == null ? null : ifd0.getString(ExifIFD0Directory.TAG_DATETIME);
        }
        if (raw == null) {
            return null;
        }
        try {
            return LocalDateTime.parse(raw.trim(), EXIF_TIME);
        } catch (Exception e) {
            return null;
        }
    }

    private GeoLocation readLocation(Metadata metadata) {
        GpsDirectory gps = metadata.getFirstDirectoryOfType(GpsDirectory.class);
        if (gps == null) {
            return null;
        }
        GeoLocation location = gps.getGeoLocation();
        if (location == null || location.isZero()) {
            return null;
        }
        return location;
    }

    private BigDecimal scale(double value) {
        return BigDecimal.valueOf(value).setScale(6, RoundingMode.HALF_UP);
    }
}