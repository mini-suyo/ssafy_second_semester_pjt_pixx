package com.ssafy.fourcut.domain.user.controller;

import com.ssafy.fourcut.domain.user.entity.User;
import com.ssafy.fourcut.domain.user.repository.UserRepository;
import com.ssafy.fourcut.global.dto.ApiResponse;
import com.ssafy.fourcut.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class KakaoAuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RestTemplate restTemplate;

    @Value("${spring.security.oauth2.client.registration.kakao.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.kakao.client-secret}")
    private String clientSecret;

    @Value("${spring.security.oauth2.client.registration.kakao.redirect-uri}")
    private String redirectUri;

    private final String tokenUri = "https://kauth.kakao.com/oauth/token";
    private final String userInfoUri = "https://kapi.kakao.com/v2/user/me";

    // 🔹 카카오 로그인 콜백 처리 (GET)
    @GetMapping("/kakao/callback")
    public ResponseEntity<ApiResponse<Map<String, String>>> kakaoCallback(@RequestParam("code") String code) {
        try {
            String kakaoAccessToken = getKakaoAccessToken(code);
            Map<String, Object> kakaoUser = getKakaoUserInfo(kakaoAccessToken);

            Long kakaoId = Long.valueOf(String.valueOf(kakaoUser.get("id")));
            Map<String, Object> kakaoAccount = (Map<String, Object>) kakaoUser.get("kakao_account");
            String email = (String) kakaoAccount.get("email");
            Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
            String nickname = (String) profile.get("nickname");

            Optional<User> userOpt = userRepository.findByKakaoId(kakaoId);

            User user = userOpt.orElseGet(() -> userRepository.save(User.builder()
                    .kakaoId(kakaoId)
                    .nickname(nickname)
                    .userEmail(email)
                    .createdAt(LocalDateTime.now())
                    .userToken(0)
                    .build()
            ));

            String accessToken = jwtTokenProvider.createAccessToken(Map.of(
                    "user_id", user.getUserId(),
                    "kakao_id", user.getKakaoId(),
                    "nickname", user.getNickname(),
                    "user_email", user.getUserEmail()
            ));

            String refreshToken = jwtTokenProvider.createRefreshToken();

            return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                    .status(200)
                    .message("카카오 로그인 성공")
                    .data(Map.of(
                            "access_token", accessToken,
                            "refresh_token", refreshToken
                    ))
                    .build());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.<Map<String, String>>builder()
                    .status(500)
                    .message("카카오 로그인 실패: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    // 🔹 로그아웃 API
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout() {
        return ResponseEntity.ok(ApiResponse.builder()
                .status(200)
                .message("로그아웃 완료. 클라이언트가 저장된 토큰 삭제하세요.")
                .data(null)
                .build());
    }

    // 🔹 카카오 액세스 토큰 요청
    private String getKakaoAccessToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<Map> response = restTemplate.exchange(tokenUri, HttpMethod.POST, request, Map.class);

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("access_token") == null) {
            throw new RuntimeException("카카오 토큰 요청 실패");
        }

        return (String) body.get("access_token");
    }

    // 🔹 카카오 사용자 정보 요청
    private Map<String, Object> getKakaoUserInfo(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(userInfoUri, HttpMethod.GET, entity, Map.class);

        Map<String, Object> body = response.getBody();
        if (body == null || body.get("id") == null) {
            throw new RuntimeException("카카오 사용자 정보 조회 실패");
        }

        return body;
    }
}