// src/main/java/com/ssafy/fourcut/domain/image/controller/FeedController.java
package com.ssafy.fourcut.domain.image.controller;

import com.ssafy.fourcut.domain.image.dto.FeedDateResponse;
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

    /**
     * GET /api/feed/date
     * 헤더: Authorization: Bearer <JWT>
     * 요청 바디: 없음
     * 응답: ApiResponse<List<FeedDateResponse>>
     */
    @GetMapping("/date")
    public ResponseEntity<ApiResponse<List<FeedDateResponse>>> getFeedsByDate(Principal principal) {
        // Principal#getName()에 유저 ID가 담겨 있다고 가정
//        Long userId = Long.valueOf(principal.getName());
        Integer userId = 1;
        List<FeedDateResponse> data = feedService.getFeedsByDate(userId);
        ApiResponse<List<FeedDateResponse>> resp = ApiResponse.<List<FeedDateResponse>>builder()
                .status(Integer.parseInt("200"))
                .message("날짜 별 피드 조회 성공")
                .data(data)
                .build();

        return ResponseEntity.ok(resp);
    }
}
