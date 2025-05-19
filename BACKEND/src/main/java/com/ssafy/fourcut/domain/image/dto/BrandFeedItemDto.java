package com.ssafy.fourcut.domain.image.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BrandFeedItemDto {
    private Integer feedId;
    private String feedThumbnailImgUrl;
    private Boolean feedFavorite;
}