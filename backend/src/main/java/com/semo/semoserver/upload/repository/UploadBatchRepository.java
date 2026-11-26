package com.semo.semoserver.upload.repository;

import com.semo.semoserver.upload.entity.UploadBatch;
import com.semo.semoserver.upload.entity.UploadStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UploadBatchRepository extends JpaRepository<UploadBatch, Long> {

    List<UploadBatch> findAllByStatus(UploadStatus status);
}