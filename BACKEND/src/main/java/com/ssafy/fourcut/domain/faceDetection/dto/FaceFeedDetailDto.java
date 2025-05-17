package com.ssafy.fourcut.domain.faceDetection.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceFeedDetailDto {
    private String faceName;
    private List<FaceFeedItemDto> faceFeedList;
}
