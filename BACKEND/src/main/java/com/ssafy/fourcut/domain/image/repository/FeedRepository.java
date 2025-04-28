// src/main/java/com/ssafy/fourcut/domain/image/repository/FeedRepository.java
package com.ssafy.fourcut.domain.image.repository;

import com.ssafy.fourcut.domain.image.entity.Feed;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedRepository extends JpaRepository<Feed, Integer> {
    // user.userId 컬럼 기준으로 내림차순 정렬
    List<Feed> findByUserUserIdOrderByFeedDateDesc(int userId);
}
