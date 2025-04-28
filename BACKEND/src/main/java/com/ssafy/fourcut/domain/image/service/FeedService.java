// src/main/java/com/ssafy/fourcut/domain/image/service/FeedService.java
package com.ssafy.fourcut.domain.image.service;

import com.ssafy.fourcut.domain.image.dto.FeedDateResponse;
import com.ssafy.fourcut.domain.image.entity.Feed;
import com.ssafy.fourcut.domain.image.repository.FeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {
    private final FeedRepository feedRepository;

    /**
     * 해당 유저의 모든 피드를 날짜 내림차순으로 조회한 뒤
     * 첫 번째 이미지 URL을 썸네일로 사용합니다.
     */
    public List<FeedDateResponse> getFeedsByDate(Integer userId) {
        List<Feed> feeds = feedRepository.findByUserUserIdOrderByFeedDateDesc(userId);
        return feeds.stream()
                .map(feed -> {
                    // 엔티티 내 이미지 컬렉션 필드명이 imageList 혹은 images인 경우에 따라 조정
                    String thumbnail = feed.getImages().stream()
                            .findFirst()
                            .map(img -> img.getImageUrl())
                            .orElse("");
                    return new FeedDateResponse(
                            feed.getFeedId(),
                            thumbnail,
                            feed.getFeedDate()
                    );
                })
                .collect(Collectors.toList());
    }
}
