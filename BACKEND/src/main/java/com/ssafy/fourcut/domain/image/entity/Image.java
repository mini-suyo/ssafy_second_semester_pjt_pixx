package com.ssafy.fourcut.domain.image.entity;

import com.ssafy.fourcut.domain.image.entity.enums.ImageType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "image")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Integer imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feed_id", nullable = false)
    private Feed feed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "album_id", nullable = false)
    private Album album;

    @Column(name = "image_url", length = 200)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "image_type", length = 10)
    private ImageType imageType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}