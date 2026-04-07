package com.myapp.backend.service;

import com.myapp.backend.dto.DocumentResponse;
import com.myapp.backend.entity.Document;
import com.myapp.backend.entity.User;
import com.myapp.backend.repository.DocumentRepository;
import com.myapp.backend.repository.UserRepository;
import io.minio.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentService {

    private final MinioClient minioClient;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public DocumentService(MinioClient minioClient,
                           DocumentRepository documentRepository,
                           UserRepository userRepository) {
        this.minioClient = minioClient;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    public DocumentResponse upload(Long userId, MultipartFile file) throws Exception {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucketName).build()
        );

        if (!exists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucketName).build()
            );
        }

        String objectName = UUID.randomUUID() + "-" + file.getOriginalFilename();

        try (InputStream is = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(is, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        }

        Document doc = new Document();
        doc.setFileName(file.getOriginalFilename());
        doc.setObjectName(objectName);
        doc.setContentType(file.getContentType());
        doc.setSize(file.getSize());
        doc.setUploadedAt(LocalDateTime.now());
        doc.setUser(user);

        Document saved = documentRepository.save(doc);

        return new DocumentResponse(
                saved.getId(),
                saved.getFileName(),
                saved.getObjectName(),
                saved.getContentType(),
                saved.getSize(),
                saved.getUploadedAt()
        );
    }

    public List<DocumentResponse> getUserDocuments(Long userId) {
        return documentRepository.findByUserId(userId)
                .stream()
                .map(doc -> new DocumentResponse(
                        doc.getId(),
                        doc.getFileName(),
                        doc.getObjectName(),
                        doc.getContentType(),
                        doc.getSize(),
                        doc.getUploadedAt()
                ))
                .toList();
    }

    public Document getDocumentEntity(Long userId, Long documentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Evrak bulunamadı"));

        if (!document.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bu evrak belirtilen kullanıcıya ait değil");
        }

        return document;
    }

    public void deleteDocument(Long userId, Long documentId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Evrak bulunamadı"));

        if (!document.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bu evrak belirtilen kullanıcıya ait değil");
        }

        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(document.getObjectName())
                        .build()
        );

        documentRepository.delete(document);
    }
}