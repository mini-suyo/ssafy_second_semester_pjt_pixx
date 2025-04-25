package com.ssafy.fourcut.domain.image.entity;

import com.ssafy.fourcut.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "feed")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Feed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feed_id")
    private Integer feedId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(name = "feed_location", nullable = false, length = 100)
    private String feedLocation;

    @Column(name = "feed_date", nullable = false)
    private LocalDateTime feedDate;

    @Column(name = "feed_memo", length = 100)
    private String feedMemo;

    @Column(name = "feed_favorite", nullable = false)
    private Boolean feedFavorite;

    @OneToMany(mappedBy = "feed", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HashFeed> hashFeeds;

    @OneToMany(mappedBy = "feed", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images;
}