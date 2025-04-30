package com.ssafy.fourcut.domain.user.controller;

import com.ssafy.fourcut.domain.user.dto.TokenDto;
import com.ssafy.fourcut.domain.user.service.KakaoAuthService;
import com.ssafy.fourcut.global.dto.ApiResponse;
import com.ssafy.fourcut.global.security.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class KakaoAuthController {

    private final KakaoAuthService kakaoAuthService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String kakaoClientId;

    @Value("${kakao.logout-redirect-uri}")
    private String kakaoLogoutRedirectUri;


    // 카카오 로그인
    @PostMapping("/kakao/login")
    public ResponseEntity<ApiResponse<TokenDto>> kakaoLogin(@RequestBody Map<String,String> body) {
        String code = body.get("code");
        TokenDto tokens = kakaoAuthService.loginWithKakao(code);
        return ResponseEntity.ok(
                ApiResponse.<TokenDto>builder()
                        .status(200)
                        .message("카카오 로그인 성공")
                        .data(tokens)
                        .build()
        );
    }

    // 개발용 jwt 토큰 발급
    @PostMapping("/kakao/jwt")
    public ResponseEntity<ApiResponse<TokenDto>> issueJwtByKakaoId(@RequestBody Map<String, Long> body) {
        Long kakaoId = body.get("kakao_id");
        TokenDto tokens = kakaoAuthService.loginWithKakaoId(kakaoId);
        return ResponseEntity.ok(
                ApiResponse.<TokenDto>builder()
                        .status(200)
                        .message("카카오 ID 기반 JWT 발급 성공")
                        .data(tokens)
                        .build()
        );
    }

    // 서비스 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout() {
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .status(200)
                        .message("로그아웃이 완료되었습니다.")
                        .data(null)
                        .build()
        );
    }

    // 카카오 로그아웃
    @GetMapping("/logout/kakao")
    public void kakaoLogout(HttpServletResponse response) throws IOException {
        String kakaoLogoutUrl = "https://kauth.kakao.com/oauth/logout"
                + "?client_id=" + kakaoClientId
                + "&logout_redirect_uri=" + kakaoLogoutRedirectUri;
        response.sendRedirect(kakaoLogoutUrl);
    }

    // 회원 탈퇴
    @DeleteMapping("/withdraw")
    public ResponseEntity<ApiResponse<Object>> withdraw(
            @RequestHeader("Authorization") String authHeader) {

        // 토큰 유효성 검사
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.builder()
                            .status(401)
                            .message("유효한 액세스 토큰이 필요합니다.")
                            .data(null)
                            .build()
                    );
        }
        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.builder()
                            .status(401)
                            .message("유효한 액세스 토큰이 필요합니다.")
                            .data(null)
                            .build()
                    );
        }

        Claims claims = jwtTokenProvider.parseToken(token);
        Integer userId = claims.get("user_id", Integer.class);

        kakaoAuthService.withdrawByUserId(userId);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .status(200)
                        .message("회원 탈퇴가 완료되었습니다.")
                        .data(null)
                        .build()
        );
    }

    // 액세스 토큰 발급
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String,String>>> refresh(
            @RequestBody Map<String,String> body) {
        String refreshToken = body.get("refresh_token");
        // 토큰 유효성 검사
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Map<String,String>>builder()
                            .status(401)
                            .message("유효한 리프레시 토큰이 필요합니다.")
                            .data(null)
                            .build());
        }

        Claims claims = jwtTokenProvider.parseToken(refreshToken);
        Integer userId = claims.get("user_id", Integer.class);

        // 새로운 액세스 토큰(·리프레시 토큰)을 발급
        String newAccessToken = jwtTokenProvider.createAccessToken(
                Map.of("user_id", userId));
        String newRefreshToken = jwtTokenProvider.createRefreshToken(userId);

        return ResponseEntity.ok(
                ApiResponse.<Map<String,String>>builder()
                        .status(200)
                        .message("토큰 재발급 성공")
                        .data(Map.of(
                                "access_token", newAccessToken,
                                "refresh_token", newRefreshToken
                        ))
                        .build()
        );
    }


}