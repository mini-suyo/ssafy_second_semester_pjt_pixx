package com.ssafy.fourcut.domain.faceDetection.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class FaceListItemDto {
    private Integer faceId;
    private String  faceName;       // face_cluster_name
    private String  faceThumbnail;  // face_thumbnail
    private LocalDateTime faceDate; // created_at
}
