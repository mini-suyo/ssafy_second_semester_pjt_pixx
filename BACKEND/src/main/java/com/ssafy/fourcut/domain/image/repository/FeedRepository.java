// src/main/java/com/ssafy/fourcut/domain/image/repository/FeedRepository.java
package com.ssafy.fourcut.domain.image.repository;

import com.ssafy.fourcut.domain.image.entity.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedRepository extends JpaRepository<Feed, Integer> {
    Page<Feed> findByUserUserIdOrderByFeedDateDesc(Integer userId, Pageable pageable);
    Page<Feed> findByUserUserIdOrderByFeedDateAsc(Integer userId, Pageable pageable);
    List<Feed> findByFeedFavoriteTrueAndUser_UserId(Integer userId);

    // (1) 사용자의 피드에 등장하는 브랜드명을 중복 없이 조회
    @Query("SELECT DISTINCT f.brand.brandName FROM Feed f WHERE f.user.userId = :userId")
    List<String> findDistinctBrandNamesByUser(@Param("userId") Integer userId);

    // (2) 브랜드별 최신 2개 피드 조회
    List<Feed> findTop2ByUserUserIdAndBrandBrandNameOrderByFeedDateDesc(
            Integer userId,
            String brandName
    );

    /** 앨범 단위로 페이징된 최신순/오래된순 조회 */
    Page<Feed> findByAlbumAlbumIdOrderByFeedDateDesc(Integer albumId, Pageable pageable);
    Page<Feed> findByAlbumAlbumIdOrderByFeedDateAsc(Integer albumId, Pageable pageable);

    /** 앨범 속 피드 중 가장 과거인 하나만 뽑아오기 (albumDate 계산용) */
    Feed findTop1ByAlbumAlbumIdOrderByFeedDateAsc(Integer albumId);

    // 좋아요 앨범 전용
    Page<Feed> findByFeedFavoriteTrueAndUser_UserIdOrderByFeedDateDesc(Integer userId, Pageable pageable);
    Page<Feed> findByFeedFavoriteTrueAndUser_UserIdOrderByFeedDateAsc(Integer userId, Pageable pageable);
    Feed findTop1ByFeedFavoriteTrueAndUser_UserIdOrderByFeedDateAsc(Integer userId);

    /**
     * 상세조회용: images, hashFeeds → hashtag, brand 연관관계까지 한 번에 fetch
     */
    @EntityGraph(attributePaths = {
            "images",
            "hashFeeds.hashtag",
            "brand"
    })
    Optional<Feed> findWithDetailsByFeedId(Integer feedId);

    // face_feed 에서 뽑은 feedId들 + 로그인한 userId 로 페이징 조회
    Page<Feed> findByFeedIdInAndUser_UserId(List<Integer> feedIds, Integer userId, Pageable pageable);
    Page<Feed> findByUser_UserIdAndBrand_BrandId(
            Integer userId,
            Integer brandId,
            Pageable pageable
    );
}
