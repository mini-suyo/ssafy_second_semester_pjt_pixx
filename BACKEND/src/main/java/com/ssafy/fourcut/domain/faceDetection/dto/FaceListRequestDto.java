package com.ssafy.fourcut.domain.faceDetection.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class FaceListRequestDto {
    private int type = 0;   // 0: 최신순(desc), 1: 오래된 순(asc)
    private int page = 0;   // 기본 0
    private int size = 20;  // 기본 20
}
