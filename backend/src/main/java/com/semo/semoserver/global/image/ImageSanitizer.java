package com.semo.semoserver.global.image;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * 이미지를 다시 그려서 저장해 EXIF(GPS 포함)를 모두 지운다.
 * 휴대폰 사진은 EXIF의 회전 정보로 세워 보이게 하므로, 지우기 전에 회전을 실제로 적용한다.
 * JPEG, PNG만 처리한다.
 */
@Component
public class ImageSanitizer {

    private static final long MAX_SIZE = 20L * 1024 * 1024; // 20MB

    public record SanitizedImage(byte[] bytes, String contentType, String extension) {
    }

    public SanitizedImage stripMetadata(MultipartFile file) {
        if (file.getSize() > MAX_SIZE) {
            throw new CustomException(ErrorCode.FILE_TOO_LARGE);
        }
        String contentType = file.getContentType();
        boolean isJpeg = "image/jpeg".equals(contentType);
        boolean isPng = "image/png".equals(contentType);
        if (!isJpeg && !isPng) {
            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE);
        }

        try {
            byte[] original = file.getBytes();
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(original));
            if (image == null) {
                throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE);
            }
            if (isJpeg) {
                image = toRgb(rotate(image, readOrientation(original)));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(image, isJpeg ? "jpg" : "png", out);
            return new SanitizedImage(out.toByteArray(), contentType, isJpeg ? ".jpg" : ".png");
        } catch (IOException e) {
            throw new CustomException(ErrorCode.UNSUPPORTED_FILE_TYPE);
        }
    }

    private int readOrientation(byte[] bytes) {
        try {
            Metadata metadata = ImageMetadataReader.readMetadata(new ByteArrayInputStream(bytes));
            ExifIFD0Directory dir = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (dir != null && dir.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) {
                return dir.getInt(ExifIFD0Directory.TAG_ORIENTATION);
            }
        } catch (Exception ignored) {
            // 회전 정보를 못 읽으면 그대로 두기
        }
        return 1;
    }

    // EXIF orientation 3(180도), 6(시계 90도), 8(시계 270도)만 처리
    private BufferedImage rotate(BufferedImage src, int orientation) {
        int degrees = switch (orientation) {
            case 3 -> 180;
            case 6 -> 90;
            case 8 -> 270;
            default -> 0;
        };
        if (degrees == 0) {
            return src;
        }
        int w = src.getWidth();
        int h = src.getHeight();
        boolean swap = degrees != 180;
        BufferedImage dst = new BufferedImage(swap ? h : w, swap ? w : h, BufferedImage.TYPE_INT_RGB);

        AffineTransform t = new AffineTransform();
        switch (degrees) {
            case 90 -> t.translate(h, 0);
            case 180 -> t.translate(w, h);
            case 270 -> t.translate(0, w);
            default -> { }
        }
        t.rotate(Math.toRadians(degrees));

        Graphics2D g = dst.createGraphics();
        g.drawImage(src, t, null);
        g.dispose();
        return dst;
    }

    // JPEG로 쓸 때 RGB로 바꾸기 
    private BufferedImage toRgb(BufferedImage src) {
        if (src.getType() == BufferedImage.TYPE_INT_RGB) {
            return src;
        }
        BufferedImage rgb = new BufferedImage(src.getWidth(), src.getHeight(), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = rgb.createGraphics();
        g.drawImage(src, 0, 0, null);
        g.dispose();
        return rgb;
    }
}
