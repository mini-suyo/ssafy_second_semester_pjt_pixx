package com.ssafy.fourcut.domain.faceDetection.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceFeedRequestDto {
    private int type;  // 0: 최신순, 1: 오래된순
    private int page = 0;
    private int size = 10;
}
