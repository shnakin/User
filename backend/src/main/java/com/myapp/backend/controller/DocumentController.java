package com.myapp.backend.controller;

import com.myapp.backend.dto.DocumentResponse;
import com.myapp.backend.entity.Document;
import com.myapp.backend.service.DocumentService;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public DocumentController(DocumentService documentService, MinioClient minioClient) {
        this.documentService = documentService;
        this.minioClient = minioClient;
    }

    @PostMapping
    public ResponseEntity<DocumentResponse> upload(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        return ResponseEntity.ok(documentService.upload(userId, file));
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> list(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(documentService.getUserDocuments(userId));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<Map<String, String>> delete(
            @PathVariable Long userId,
            @PathVariable Long documentId
    ) throws Exception {
        documentService.deleteDocument(userId, documentId);
        return ResponseEntity.ok(Map.of("message", "Evrak silindi"));
    }

    @GetMapping("/{documentId}/preview")
    public ResponseEntity<byte[]> preview(
            @PathVariable Long userId,
            @PathVariable Long documentId
    ) throws Exception {
        Document document = documentService.getDocumentEntity(userId, documentId);

        try (InputStream inputStream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(document.getObjectName())
                        .build()
        )) {
            byte[] content = inputStream.readAllBytes();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + document.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(document.getContentType()))
                    .body(content);
        }
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<byte[]> download(
            @PathVariable Long userId,
            @PathVariable Long documentId
    ) throws Exception {
        Document document = documentService.getDocumentEntity(userId, documentId);

        try (InputStream inputStream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(document.getObjectName())
                        .build()
        )) {
            byte[] content = inputStream.readAllBytes();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + document.getFileName() + "\"")
                    .contentType(MediaType.parseMediaType(document.getContentType()))
                    .body(content);
        }
    }
}