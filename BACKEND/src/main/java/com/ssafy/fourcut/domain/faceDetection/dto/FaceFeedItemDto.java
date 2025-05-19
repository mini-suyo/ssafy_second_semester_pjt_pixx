package com.ssafy.fourcut.domain.faceDetection.dto;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceFeedItemDto {
    private Integer feedId;
    private String feedThumbnailImgUrl;
    private Boolean feedFavorite;
    private List<Integer> detectionIds;
}
