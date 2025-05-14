package com.ssafy.fourcut.global.s3;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.ssafy.fourcut.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class S3Uploader {

    private final AmazonS3 amazonS3;

    @Value("${BUCKET_NAME}")
    private String bucketName;

    public String upload(int userId, InputStream inputStream, String originalFilename, String contentType, Long contentLength) {
        try {
            String datePath = LocalDate.now().toString().replace("-", "/"); // 2025/04/29
            String s3Key = "users/" + userId + "/" + datePath + "/" + originalFilename;

            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(contentType);
            metadata.setContentLength(contentLength);

            amazonS3.putObject(bucketName, s3Key, inputStream, metadata);
            return s3Key;
        } catch (Exception e) {
            throw new CustomException(500, "S3 파일 업로드 실패");
        }
    }

    public void delete(String s3Key) {
        try {
            amazonS3.deleteObject(bucketName, s3Key);
        } catch (Exception e) {
            throw new CustomException(500, "S3 파일 삭제 실패");
        }
    }
}
