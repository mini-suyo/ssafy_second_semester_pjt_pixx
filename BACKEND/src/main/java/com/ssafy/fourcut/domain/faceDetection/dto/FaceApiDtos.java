package com.ssafy.fourcut.domain.faceDetection.dto;

import lombok.*;

import java.util.List;

public class FaceApiDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetectRequest {
        private String imgUrl;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClusterRequest {
        private String faceClusterName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor @Builder
    public static class FaceDetectDto {
        private List<Double> boundingBox;   // [x1,y1,x2,y2]
        private List<Double> vectorData;     // 임베딩 벡터
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetectResponse {
        private int status;
        private String message;
        private List<FaceDetectDto> data;
    }
}