package com.ssafy.fourcut.domain.faceDetection.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
@NoArgsConstructor
public class FaceInvalidRequestDto {
    private List<Integer> detectionIds;
}
