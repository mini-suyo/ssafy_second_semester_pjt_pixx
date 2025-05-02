// src/main/java/com/ssafy/fourcut/domain/image/controller/FeedController.java
package com.ssafy.fourcut.domain.image.controller;

import com.ssafy.fourcut.domain.image.dto.*;
import com.ssafy.fourcut.domain.image.service.AlbumService;
import com.ssafy.fourcut.domain.image.service.FeedService;
import com.ssafy.fourcut.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/feed")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;
    private final AlbumService albumService;

    /**
     * POST /api/v1/feed
     * body: { "type":0|1|2, "page":0, "size":20 }
     */
    @PostMapping
    public ResponseEntity<ApiResponse<?>> getFeeds(
            Principal principal,
            @RequestBody FeedListRequest req
    ) {
        Integer userId = Integer.valueOf(principal.getName());
        int type = req.getType();
        int page = req.getPage();
        int size = req.getSize();

        if (type == 2) {
            // 브랜드별 Top2 페치
            FeedByBrandResponse data = feedService.getFeedsGroupedByBrand(userId);
            return ResponseEntity.ok(ApiResponse.<FeedByBrandResponse>builder()
                    .status(Integer.parseInt("200"))
                    .message("날짜 별 피드 조회 성공")
                    .data(data)
                    .build()
            );
        } else {
            // 최신/오래된 페치 (페이징)
            List<FeedItemResponse> data = feedService.getFeedsSorted(userId, type, page, size);
            return ResponseEntity.ok(ApiResponse.<List<FeedItemResponse>>builder()
                    .status(Integer.parseInt("200"))
                    .message("날짜 별 피드 조회 성공")
                    .data(data)
                    .build()
            );
        }
    }
    /**
     * GET /api/v1/feed/album
     * 피드 상세보기 (앨범별 이미지)
     */
    @GetMapping("/album")
    public ResponseEntity<ApiResponse<FeedAlbumResponse>> getFeedAlbum(Principal principal) {
        Integer userId = Integer.valueOf(principal.getName());
        FeedAlbumResponse  data = albumService.getFeedAlbum(userId);
        ApiResponse<FeedAlbumResponse> resp = ApiResponse.<FeedAlbumResponse>builder()
                .status(Integer.parseInt("200"))
                .message("앨범 불러오기 성공")
                .data(data)
                .build();
        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/v1/feed/album/{album_id}
     * body: { "type":0|1, "page":0, "size":10 }
     */
    @PostMapping("/album/{album_id}")
    public ResponseEntity<ApiResponse<AlbumDetailResponse>> getAlbumDetail(
            Principal principal,
            @PathVariable("album_id") Integer albumId,
            @RequestBody FeedListRequest req
    ) {
        Integer userId = Integer.valueOf(principal.getName());
        AlbumDetailResponse data = albumService.getAlbumDetail(
                userId,
                albumId,
                req.getType(),
                req.getPage(),
                req.getSize()
        );
        ApiResponse<AlbumDetailResponse> resp = ApiResponse.<AlbumDetailResponse>builder()
                .status(Integer.parseInt("200"))
                .message("앨범 디테일 보기 성공")
                .data(data)
                .build();
        return ResponseEntity.ok(resp);
    }
}
