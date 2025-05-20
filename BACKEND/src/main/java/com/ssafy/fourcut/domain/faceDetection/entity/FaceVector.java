package com.ssafy.fourcut.domain.faceDetection.entity;

import com.ssafy.fourcut.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CurrentTimestamp;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "face_vector")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class FaceVector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "face_id")
    private Integer faceId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Lob
    @Column(name = "face_vector_data", columnDefinition = "JSON", nullable = false)
    private String faceVectorData;

    @Column(name = "face_cluster_name", length = 30)
    private String faceClusterName; // null 일 경우 분류되지 않음

    @Column(name = "created_at", nullable = false)
    @CurrentTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy="faceVector", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<FaceDetection> detections = new ArrayList<>();

    @Column(name = "detection_count", nullable = false, columnDefinition = "INT DEFAULT 1")
    private Integer detectionCount = 1;

    @Column(name = "face_thumbnail", nullable = false)
    private String faceThumbnail;

    @OneToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "rep_detection_id")
    private FaceDetection repDetection;

    public void updateFaceThumbnail(String thumbnail) {
        this.faceThumbnail = thumbnail;
    }
}
