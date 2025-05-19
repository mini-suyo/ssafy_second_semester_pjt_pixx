package com.ssafy.fourcut.domain.image.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrandFeedRequestDto {
    private int type;  // 0: 최신순, 1: 오래된순
    private int page;
    private int size;
}