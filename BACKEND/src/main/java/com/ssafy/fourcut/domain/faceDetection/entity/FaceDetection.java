package com.ssafy.fourcut.domain.faceDetection.entity;

import com.ssafy.fourcut.domain.image.entity.Image;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CurrentTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "face_detection")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class FaceDetection {

    @Id
    @Column(name = "detection_id", length = 255)
    private String detectionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "face_id", nullable = false)
    private FaceVector faceVector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", nullable = false)
    private Image image;

    @Column(name = "bounding_box", columnDefinition = "JSON", nullable = false)
    private String boundingBox;

    @Lob
    @Column(name = "detection_vector_data", columnDefinition = "JSON", nullable = false)
    private String detectionVectorData;

    @Column(name = "detected_at", nullable = false)
    @CurrentTimestamp
    private LocalDateTime detectedAt;
}
