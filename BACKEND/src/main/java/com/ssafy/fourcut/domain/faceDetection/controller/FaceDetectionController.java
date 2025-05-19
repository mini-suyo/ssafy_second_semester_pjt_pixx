package com.ssafy.fourcut.domain.faceDetection.controller;

import com.ssafy.fourcut.domain.faceDetection.dto.FaceApiDtos;
import com.ssafy.fourcut.domain.faceDetection.dto.FaceInvalidRequestDto;
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


    @PatchMapping("/invalidate")
    public ResponseEntity<ApiResponse<Void>> invalidateDetections(
            @RequestBody FaceInvalidRequestDto req
    ) {
        service.invalidateDetections(req.getDetectionIds());
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .status(200)
                .message("무효화 처리 성공")
                .data(null)
                .build());
    }


    /**
     * 얼굴 삭제
     * POST /api/v1/detect/{faceId}/delete
     */
    @PostMapping("/{faceId}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteFace(
            @PathVariable Integer faceId
    ) {
        service.deleteFace(faceId);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status(200)
                        .message("얼굴 삭제 성공")
                        .data(null)
                        .build()
        );
    }
}