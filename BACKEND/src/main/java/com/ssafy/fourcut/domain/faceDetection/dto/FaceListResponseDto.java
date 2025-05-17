package com.ssafy.fourcut.domain.faceDetection.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class FaceListResponseDto {
    private List<FaceListItemDto> faceList;
}
