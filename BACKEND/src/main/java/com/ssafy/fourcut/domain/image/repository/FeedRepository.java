// src/main/java/com/ssafy/fourcut/domain/image/repository/FeedRepository.java
package com.ssafy.fourcut.domain.image.repository;

import com.ssafy.fourcut.domain.image.entity.Feed;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeedRepository extends JpaRepository<Feed, Integer> {
    Page<Feed> findByUserUserIdOrderByFeedDateDesc(Integer userId, Pageable pageable);
    Page<Feed> findByUserUserIdOrderByFeedDateAsc(Integer userId, Pageable pageable);

    // (1) 사용자의 피드에 등장하는 브랜드명을 중복 없이 조회
    @Query("SELECT DISTINCT f.brand.brandName FROM Feed f WHERE f.user.userId = :userId")
    List<String> findDistinctBrandNamesByUser(@Param("userId") Integer userId);

    // (2) 브랜드별 최신 2개 피드 조회
    List<Feed> findTop2ByUserUserIdAndBrandBrandNameOrderByFeedDateDesc(
            Integer userId,
            String brandName
    );
}
