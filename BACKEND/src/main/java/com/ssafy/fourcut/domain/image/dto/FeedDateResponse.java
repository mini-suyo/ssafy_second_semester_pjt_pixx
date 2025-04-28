package com.ssafy.fourcut.domain.image.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 날짜별 사진 보기 응답 값
 */

@Getter
@AllArgsConstructor
public class FeedDateResponse {
    private Integer feedId;
    private String feedTuhmbnailImgUrl;
    private LocalDateTime feedDate;
}
