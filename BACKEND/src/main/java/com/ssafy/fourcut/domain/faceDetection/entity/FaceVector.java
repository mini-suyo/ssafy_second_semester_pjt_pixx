package com.ssafy.fourcut.domain.faceDetection.entity;

import com.ssafy.fourcut.domain.image.entity.Feed;
import com.ssafy.fourcut.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CurrentTimestamp;

import java.time.LocalDateTime;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "face_vector_data", columnDefinition = "JSON", nullable = false)
    private String faceVectorData;

    @Column(name = "face_cluster_name", length = 30)
    private String faceClusterName;

    @Column(name = "created_at", nullable = false)
    @CurrentTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy="faceVector", cascade=CascadeType.ALL, orphanRemoval=true)
    private List<FaceDetection> detections;
}
