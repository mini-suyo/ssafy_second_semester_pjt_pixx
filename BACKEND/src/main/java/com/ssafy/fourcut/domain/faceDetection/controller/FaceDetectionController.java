package com.ssafy.fourcut.domain.faceDetection.controller;

import com.ssafy.fourcut.domain.faceDetection.dto.FaceApiDtos;
import com.ssafy.fourcut.domain.faceDetection.service.FaceDetectionService;
import com.ssafy.fourcut.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/detect")
@RequiredArgsConstructor
public class FaceDetectionController {

    private final FaceDetectionService service;

    @PostMapping("/{imageId}")
    public ResponseEntity<ApiResponse<List<FaceApiDtos.FaceDetectDto>>> detect(
            @PathVariable Integer imageId,
            @RequestBody FaceApiDtos.DetectRequest req
    ) {
        List<FaceApiDtos.FaceDetectDto> data = service.processImage(imageId, req.getImgUrl());
        return ResponseEntity.ok(ApiResponse.<List<FaceApiDtos.FaceDetectDto>>builder()
                .status(200)
                .message("얼굴 검출 성공")
                .data(data)
                .build());
    }

    @PatchMapping("/cluster/{faceId}")
    public ResponseEntity<ApiResponse<Void>> clusterName(
            @PathVariable Integer faceId,
            @RequestBody FaceApiDtos.ClusterRequest req
    ) {
        service.updateClusterName(faceId, req.getFaceClusterName());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("성공적으로 변경되었습니다.")
                .data(null)
                .build()
        );
    }

    @PatchMapping("/invalidate/{detectionId}")
    public ResponseEntity<ApiResponse<Void>> invalidate(
            @PathVariable Integer detectionId
    ) {
        service.invalidateDetection(detectionId);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("무효화 처리 성공")
                .data(null)
                .build()
        );
    }
}