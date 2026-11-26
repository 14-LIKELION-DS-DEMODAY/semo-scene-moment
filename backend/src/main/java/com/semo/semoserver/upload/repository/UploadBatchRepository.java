package com.semo.semoserver.upload.repository;

import com.semo.semoserver.upload.entity.UploadBatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UploadBatchRepository extends JpaRepository<UploadBatch, Long> {
}