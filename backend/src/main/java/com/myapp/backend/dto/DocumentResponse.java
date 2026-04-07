package com.myapp.backend.dto;

import java.time.LocalDateTime;

public class DocumentResponse {

    private Long id;
    private String fileName;
    private String objectName;
    private String contentType;
    private Long size;
    private LocalDateTime uploadedAt;

    public DocumentResponse(Long id, String fileName, String objectName, String contentType, Long size, LocalDateTime uploadedAt) {
        this.id = id;
        this.fileName = fileName;
        this.objectName = objectName;
        this.contentType = contentType;
        this.size = size;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public String getObjectName() {
        return objectName;
    }

    public String getContentType() {
        return contentType;
    }

    public Long getSize() {
        return size;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}