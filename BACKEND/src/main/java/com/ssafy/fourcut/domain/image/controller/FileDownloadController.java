package com.ssafy.fourcut.domain.image.controller;

import com.ssafy.fourcut.domain.image.entity.Image;
import com.ssafy.fourcut.domain.image.repository.StoreRepository;
import com.ssafy.fourcut.domain.image.service.CloudFrontService;
import com.ssafy.fourcut.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.net.URL;

@Slf4j
@RestController
@RequestMapping("/photos")
@RequiredArgsConstructor
public class FileDownloadController {

    private final CloudFrontService cloudFrontService;
    private final StoreRepository storeRepository;

    @GetMapping("/download/{imageId}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable int imageId) {
        log.info("/api/v1/photos/download/" + imageId);

        Image image = storeRepository.findById(imageId)
                .orElseThrow(() -> new CustomException(404, "해당 이미지(" + imageId + ")를 찾을 수 없습니다."));

        String s3Key = image.getImageUrl();
        String signedUrl = cloudFrontService.generateSignedCloudFrontUrl(s3Key, "download");

        try (InputStream in = new URL(signedUrl).openStream()) {
            byte[] fileBytes = in.readAllBytes();

            // 파일 확장자에 따라 Content-Type 설정 (기본: application/octet-stream)
            MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
            if (s3Key.endsWith(".jpg") || s3Key.endsWith(".jpeg")) {
                contentType = MediaType.IMAGE_JPEG;
            } else if (s3Key.endsWith(".png")) {
                contentType = MediaType.IMAGE_PNG;
            } else if (s3Key.endsWith(".mp4")) {
                contentType = MediaType.valueOf("video/mp4");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(contentType);
            headers.setContentDisposition(
                    ContentDisposition.attachment()
                            .filename(s3Key.substring(s3Key.lastIndexOf("/") + 1))
                            .build()
            );

            return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("파일 다운로드 실패", e);
            throw new CustomException(500, "파일 다운로드 중 오류가 발생했습니다.");
        }
    }
}