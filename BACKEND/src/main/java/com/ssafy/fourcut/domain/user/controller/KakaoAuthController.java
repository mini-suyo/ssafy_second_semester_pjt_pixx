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

    /**
     * GET http://localhost:8080/api/v1/auth/kakao/callback?code={authorization_code}
     */
    @GetMapping("/kakao/callback")
    public ResponseEntity<ApiResponse<TokenDto>> kakaoCallback(@RequestParam("code") String code) {
        TokenDto tokens = kakaoAuthService.loginWithKakao(code);
        return ResponseEntity.ok(
                ApiResponse.<TokenDto>builder()
                        .status(200)
                        .message("카카오 로그인 성공")
                        .data(tokens)
                        .build()
        );
    }

    /**
     * POST http://localhost:8080/api/v1/auth/kakao/login
     * Body: { "code": "{authorization_code}" }
     */
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

    /**
     * POST http://localhost:8080/api/v1/auth/logout
     * Stateless JWT 방식에서는 서버 세션이 없으므로
     * 클라이언트가 토큰을 삭제하면 로그아웃이 완료됩니다.
     */
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

    @GetMapping("/logout/kakao")
    public void kakaoLogout(HttpServletResponse response) throws IOException {
        String kakaoLogoutUrl = "https://kauth.kakao.com/oauth/logout"
                + "?client_id=" + kakaoClientId
                + "&logout_redirect_uri=" + kakaoLogoutRedirectUri;
        response.sendRedirect(kakaoLogoutUrl);
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<ApiResponse<Object>> withdraw(
            @RequestHeader("Authorization") String authHeader) {

        // 1) 토큰 유효성 검사
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

        // 2) 토큰에서 user_id 꺼내기
        Claims claims = jwtTokenProvider.parseToken(token);
        Integer userId = claims.get("user_id", Integer.class);

        // 3) 회원 탈퇴 로직 호출
        kakaoAuthService.withdrawByUserId(userId);

        // 4) 응답
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .status(200)
                        .message("회원 탈퇴가 완료되었습니다.")
                        .data(null)
                        .build()
        );
    }
}