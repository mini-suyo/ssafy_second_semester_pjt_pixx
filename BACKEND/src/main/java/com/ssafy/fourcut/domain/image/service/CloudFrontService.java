package com.ssafy.fourcut.domain.image.service;

import com.amazonaws.services.cloudfront.CloudFrontUrlSigner;
import com.amazonaws.services.cloudfront.util.SignerUtils;
import com.ssafy.fourcut.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import java.io.File;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudFrontService {

    @Value("${cloudfront.domain}")
    private String cloudFrontDomain;

    @Value("${cloudfront.keyPairId}")
    private String keyPairId;

    @Value("${cloudfront.privateKeyPath}")
    private String privateKeyPath;

    public String generateSignedCloudFrontUrl(String s3Key, String usage) {
        try {
            long time = 1000L * 60 * 5; // 5분
            if(usage.equals("get")) {
                time = (1000 * 60 * 30); // 30분
            }

            Date expiration = new Date(System.currentTimeMillis() + time);
//            File privateKey = new ClassPathResource(privateKeyPath).getFile(); // 로컬 실험용
            File privateKey = new File(privateKeyPath); // 서버용

            return CloudFrontUrlSigner.getSignedURLWithCannedPolicy(
                    SignerUtils.Protocol.https,
                    cloudFrontDomain,
                    privateKey,
                    s3Key,
                    keyPairId,
                    expiration
            );
        } catch (Exception e) {
            log.error("CloudFront 서명 URL 생성 실패", e);
            throw new CustomException(500, "CloudFront 서명 URL 생성에 실패했습니다.");
        }
    }
}