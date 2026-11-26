package com.semo.semoserver.global.storage;

import com.semo.semoserver.global.exception.CustomException;
import com.semo.semoserver.global.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Component
public class LocalFileStorage implements FileStorage {

    private final Path rootDir;
    private final String publicBaseUrl;

    public LocalFileStorage(
            @Value("${semo.storage.local-dir:./uploads}") String localDir,
            @Value("${semo.storage.public-base-url:http://localhost:8080/files}") String publicBaseUrl) {
        this.rootDir = Paths.get(localDir).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.endsWith("/")
                ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1)
                : publicBaseUrl;
    }

    @Override
    public String upload(byte[] bytes, String directory, String extension) {
        String key = directory + "/" + UUID.randomUUID() + extension;
        Path target = rootDir.resolve(key).normalize();
        try {
            Files.createDirectories(target.getParent());
            Files.write(target, bytes);
        } catch (IOException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
        return key;
    }

    @Override
    public String getUrl(String key) {
        if (key == null) {
            return null;
        }
        return publicBaseUrl + "/" + key;
    }

    @Override
    public void delete(String key) {
        if (key == null) {
            return;
        }
        try {
            Path target = rootDir.resolve(key).normalize();
            if (target.startsWith(rootDir)) {
                Files.deleteIfExists(target);
            }
        } catch (IOException ignored) {
        }
    }
}
