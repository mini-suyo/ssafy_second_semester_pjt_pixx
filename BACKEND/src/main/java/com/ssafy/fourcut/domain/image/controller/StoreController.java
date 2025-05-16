package com.ssafy.fourcut.domain.image.controller;

import com.ssafy.fourcut.domain.faceDetection.service.FaceDetectionService;
import com.ssafy.fourcut.domain.image.dto.FileUploadRequestDto;
import com.ssafy.fourcut.domain.image.dto.QRUploadRequestDto;
import com.ssafy.fourcut.domain.image.entity.Image;
import com.ssafy.fourcut.domain.image.repository.ImageRepository;
import com.ssafy.fourcut.domain.image.entity.Image;
import com.ssafy.fourcut.domain.image.entity.enums.ImageType;
import com.ssafy.fourcut.domain.image.repository.ImageRepository;
import com.ssafy.fourcut.domain.image.service.CloudFrontService;
import com.ssafy.fourcut.domain.image.service.StoreService;
import com.ssafy.fourcut.global.dto.ApiResponse;
import com.ssafy.fourcut.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/photos/upload")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;
    private final FaceDetectionService faceDetectionService;
    private final ImageRepository imageRepository;
    private final CloudFrontService cloudFrontService;

    /*
     * QR 업로드
     */
    @PostMapping("/qr")
    public ResponseEntity<ApiResponse<Void>> uploadQr(
            Principal principal,
            @RequestBody QRUploadRequestDto request) {
        log.info("/api/v1/photos/upload/qr");
        log.info("uploadQr request - userId: {}, pageUrl: {}", request.getUserId(), request.getPageUrl());
        log.info("userId : " + principal.getName());

        // userId 넣기
        request.setUserId(Integer.parseInt(principal.getName()));

        // 새로운 feed 생성
        int feedId = storeService.createFeed(request.getUserId());
        request.setFeedId(feedId);

        // 크롤링을 하여, 파일들 저장 및 DB에 데이터 삽입
        storeService.CrawlUploadAndSave(request);

        imageRepository
                .findFirstByFeed_FeedIdAndImageTypeOrderByImageIdAsc(
                        request.getFeedId(),
                        ImageType.IMAGE      // IMAGE 타입 중에서
                )
                .ifPresent(img -> {
                    String signedUrl = cloudFrontService.generateSignedCloudFrontUrl(
                            img.getImageUrl(), "get"
                    );
                    faceDetectionService.processImage(img.getImageId(), signedUrl);
                });

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status(200)
                        .message("QR 업로드 성공")
                        .data(null)
                        .build()
        );
    }

    /*
     * 파일 업로드
     */
    @PostMapping("/file")
    public ResponseEntity<ApiResponse<Void>> uploadFile(
            Principal principal,
            @RequestPart("files") List<MultipartFile> files) {
        log.info("/api/v1/photos/upload/file");
        log.info("userId : " + principal.getName());

        if (files == null || files.isEmpty() || files.stream().allMatch(MultipartFile::isEmpty)) {
            throw new CustomException(400, "업로드할 파일이 없습니다.");
        }

        FileUploadRequestDto request = new FileUploadRequestDto();

        // userId 넣기
        request.setUserId(Integer.parseInt(principal.getName()));

        // 새로운 feed 생성
        int feedId = storeService.createFeed(request.getUserId());
        request.setFeedId(feedId);

        log.info("userId: {}, feedId: {}", request.getUserId(), request.getFeedId());
        log.info("업로드된 파일 수: {}", files.size());
        log.info("업로드된 파일 목록:");
        for (MultipartFile file : files) {
            log.info(" - {}", file.getOriginalFilename());
        }
        storeService.uploadFile(request, files);

        imageRepository
                .findFirstByFeed_FeedIdAndImageTypeOrderByImageIdAsc(
                        request.getFeedId(),
                        ImageType.IMAGE      // IMAGE 타입 중에서
                )
                .ifPresent(img -> {
                    String signedUrl = cloudFrontService.generateSignedCloudFrontUrl(
                            img.getImageUrl(), "get"
                    );
                    faceDetectionService.processImage(img.getImageId(), signedUrl);
                });

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status(200)
                        .message("파일 업로드 성공")
                        .data(null)
                        .build()
        );
    }
}
