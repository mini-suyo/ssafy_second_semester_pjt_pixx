// src/main/java/com/ssafy/fourcut/domain/image/service/FeedService.java
package com.ssafy.fourcut.domain.image.service;

import com.ssafy.fourcut.domain.image.dto.*;
import com.ssafy.fourcut.domain.image.entity.Feed;
import com.ssafy.fourcut.domain.image.entity.Image;
import com.ssafy.fourcut.domain.image.repository.FeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedService {
    private final FeedRepository feedRepository;

    /** 0,1: 페이징 정렬된 단일 리스트 (unchanged) */
    public List<FeedItemResponse> getFeedsSorted(
            Integer userId, int type, int page, int size
    ) {
        PageRequest pr = PageRequest.of(page, size);
        Page<Feed> feedPage = (type == 0)
                ? feedRepository.findByUserUserIdOrderByFeedDateDesc(userId, pr)
                : feedRepository.findByUserUserIdOrderByFeedDateAsc(userId, pr);

        return feedPage.stream()
                .map(this::toItem)
                .collect(Collectors.toList());
    }

    /** 2: 브랜드별 최신 2개 피드만 그룹화하여 반환 */
    public FeedByBrandResponse getFeedsGroupedByBrand(Integer userId) {
        // (1) 브랜드명 리스트
        List<String> brands = feedRepository.findDistinctBrandNamesByUser(userId);

        // (2) 브랜드별로 Top2 피드 조회
        List<BrandGroupResponse> brandList = brands.stream()
                .map(brandName -> {
                    List<Feed> feeds = feedRepository
                            .findTop2ByUserUserIdAndBrandBrandNameOrderByFeedDateDesc(userId, brandName);
                    List<FeedItemResponse> items = feeds.stream()
                            .map(this::toItem)
                            .collect(Collectors.toList());
                    return new BrandGroupResponse(brandName, items);
                })
                .collect(Collectors.toList());

        return new FeedByBrandResponse(brandList);
    }

    /** Feed → FeedItemResponse 변환 공통 */
    private FeedItemResponse toItem(Feed feed) {
        String thumb = feed.getImages().stream()
                .findFirst()
                .map(Image::getImageUrl)
                .orElse("");
        return new FeedItemResponse(
                feed.getFeedId(),
                thumb,
                feed.getFeedFavorite()
        );
    }
}

