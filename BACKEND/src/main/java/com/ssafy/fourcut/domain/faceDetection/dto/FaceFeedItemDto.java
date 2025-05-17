package com.ssafy.fourcut.domain.faceDetection.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FaceFeedItemDto {
    private Integer feedId;
    private String feedThumbnailImgUrl;
    private Boolean feedFavorite;
}
