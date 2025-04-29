package com.ssafy.fourcut.global.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access.expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpiration;

    private byte[] secretBytes;

    @PostConstruct
    protected void init() {
        // secretKey가 Base64가 아니면 인코딩
        if (!Base64.getEncoder().withoutPadding().encodeToString(secretKey.getBytes()).equals(secretKey)) {
            this.secretBytes = Base64.getEncoder().encode(secretKey.getBytes(StandardCharsets.UTF_8));
        } else {
            this.secretBytes = Base64.getDecoder().decode(secretKey);
        }
    }

    // 🔹 JWT 토큰 생성
    public String createToken(Map<String, Object> claims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(Keys.hmacShaKeyFor(secretBytes), SignatureAlgorithm.HS256)
                .compact();
    }

    // 🔹 토큰 안의 클레임 추출
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secretBytes))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            return null; // 유효하지 않은 토큰
        }
    }

    // 🔹 토큰 유효성 검사
    public boolean validateToken(String token) {
        return parseToken(token) != null;
    }

    public String createAccessToken(Map<String, Object> claims) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(Keys.hmacShaKeyFor(secretBytes), SignatureAlgorithm.HS256)
                .compact();
    }

    public String createRefreshToken() {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(Keys.hmacShaKeyFor(secretBytes), SignatureAlgorithm.HS256)
                .compact();
    }
}