package com.ssafy.fourcut.domain.faceDetection.service;

import com.ssafy.fourcut.domain.faceDetection.dto.FaceApiDtos;
import com.ssafy.fourcut.domain.faceDetection.entity.FaceDetection;
import com.ssafy.fourcut.domain.faceDetection.entity.FaceVector;

import com.ssafy.fourcut.domain.faceDetection.repository.FaceDetectionRepository;
import com.ssafy.fourcut.domain.faceDetection.repository.FaceVectorRepository;


import com.ssafy.fourcut.domain.image.entity.Image;
import com.ssafy.fourcut.domain.image.repository.ImageRepository;
import com.ssafy.fourcut.global.exception.CustomException;
import com.ssafy.fourcut.global.s3.S3Uploader;
import lombok.RequiredArgsConstructor;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FaceDetectionService {

    private final RestTemplate restTemplate;
    private final FaceDetectionRepository detectionRepo;
    private final FaceVectorRepository vectorRepo;
    private final ImageRepository imageRepo;
    private final S3Uploader s3Uploader;

    @Value("${face-api.url}")
    private String faceApiUrl;


    /**
     * 1) FastAPI에 이미지 보내서 얼굴 검출 → face_detection 저장
     * 2) 새로 저장된 face_detection 전부에 대해 유사도 검사 → face_vector 생성/갱신 + 썸네일
     * 3) 검출 결과 DTO를 그대로 반환
     */
    @Transactional
    public List<FaceApiDtos.FaceDetectDto> processImage(Integer imageId, String imgUrl) {
        // --- 1) FastAPI 호출 & face_detection 저장 ---
        String url = faceApiUrl + "/api/v1/detect/" + imageId;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<FaceApiDtos.DetectRequest> req =
                new HttpEntity<>(new FaceApiDtos.DetectRequest(imgUrl), headers);

        // --- 1) FastAPI 호출 & face_detection 저장 ---
        ResponseEntity<FaceApiDtos.DetectResponse> resp = restTemplate
                .exchange(url, HttpMethod.POST, req, FaceApiDtos.DetectResponse.class);
        if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) {
            throw new CustomException(400, "얼굴 검출 API 오류");      // ← 변경
        }
        FaceApiDtos.DetectResponse body = resp.getBody();
        if (body.getStatus() != 200) {
            throw new CustomException(400, "검출 실패: " + body.getMessage());  // ← 변경
        }

        // DB에 저장
        Image image = imageRepo.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found: " + imageId));
        for (FaceApiDtos.FaceDetectDto dto : body.getData()) {
            FaceDetection det = FaceDetection.builder()
                    .image(image)
                    .boundingBox(dto.getBoundingBox().toString())
                    .detectionVectorData(dto.getVectorData().toString())
                    .valid(true)
                    .build();
            detectionRepo.save(det);
        }

        // --- 2) 새로 저장된 검출들만 골라 클러스터링 ---
        List<FaceDetection> newDets = detectionRepo
                .findByFaceVectorIsNullAndValidTrueAndImage_ImageId(imageId);

        for (FaceDetection det : newDets) {
            FaceVector best = findBestMatch(det);
            if (best != null) {
                // 기존 클러스터에 합치기
                det.setFaceVector(best);
                updateCentroid(best, det);
                vectorRepo.save(best);
            } else {
                // 신규 클러스터 & 썸네일 생성
                FaceVector fv = FaceVector.builder()
                        .user(det.getImage().getFeed().getUser())
                        .faceVectorData(det.getDetectionVectorData())
                        .detectionCount(1)
                        .repDetection(det)                      // ← 여기 추가
                        .build();

                String key = uploadThumbnailToS3(
                        det.getImage().getFeed().getUser().getUserId(),
                        det.getImage().getImageUrl(),
                        det.getBoundingBox()
                );
                fv.updateFaceThumbnail(key);
                vectorRepo.save(fv);

                det.setFaceVector(fv);
            }
            detectionRepo.save(det);
        }

        return body.getData();
    }

    /** 클러스터 이름 변경 (face_cluster_name) */
    @Transactional
    public void updateClusterName(Integer faceId, String clusterName) {
        FaceVector fv = vectorRepo.findById(faceId)
                .orElseThrow(() -> new RuntimeException("FaceVector not found: " + faceId));
        fv.setFaceClusterName(clusterName);
        vectorRepo.save(fv);
    }

    /** 잘못된 검출 무효화 */
    @Transactional
    public void invalidateDetection(Integer detectionId) {
        FaceDetection det = detectionRepo.findById(detectionId)
                .orElseThrow(() -> new RuntimeException("Detection not found: " + detectionId));
        det.setValid(false);
        detectionRepo.save(det);
    }


    // ──── Helpers ─────────────────────────────────────────────────────────────────

    private String uploadThumbnailToS3(
            Integer userId, String imageUrl, String bboxJson
    ) {
        try {
            // 1) 크롭 & 리사이즈
            int[] box = parseBbox(bboxJson);
            BufferedImage original = ImageIO.read(new URL(imageUrl));
            BufferedImage faceCrop = original.getSubimage(
                    box[0], box[1], box[2] - box[0], box[3] - box[1]
            );
            BufferedImage thumb = Thumbnails.of(faceCrop)
                    .size(150, 150)
                    .outputQuality(0.8)
                    .asBufferedImage();

            // 2) 바이트 배열로 변환
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            ImageIO.write(thumb, "jpg", os);
            byte[] bytes = os.toByteArray();
            InputStream is = new ByteArrayInputStream(bytes);

            // 3) 랜덤 파일명 + thumbnail 폴더
            String filename = UUID.randomUUID().toString() + ".jpg";
            String keyInFolder = "users/" + userId + "/thumbnail/" + filename;

            // 4) S3 업로드 (ContentType, length 지정)
            return s3Uploader.upload(
                    userId,
                    is,
                    keyInFolder,
                    "image/jpeg",
                    (long) bytes.length
            );
        } catch (IOException e) {
            throw new RuntimeException("썸네일 생성 및 S3 업로드 실패", e);
        }
    }


    private FaceVector findBestMatch(FaceDetection det) {
        List<FaceVector> vectors = vectorRepo.findByUser_UserId(det.getImage().getFeed().getUser().getUserId());
        double[] emb = parseVector(det.getDetectionVectorData());
        FaceVector best = null;
        double bestSim = 0.0;
        for (FaceVector fv : vectors) {
            double sim = cosineSimilarity(emb, parseVector(fv.getFaceVectorData()));
            if (sim > 0.7 && sim > bestSim) {
                bestSim = sim;
                best = fv;
            }
        }
        return best;
    }

    private void updateCentroid(FaceVector fv, FaceDetection det) {
        double[] current = parseVector(fv.getFaceVectorData());
        double[] add     = parseVector(det.getDetectionVectorData());
        int n = fv.getDetectionCount();
        for (int i = 0; i < current.length; i++) {
            current[i] = (current[i] * n + add[i]) / (n + 1);
        }
        fv.setDetectionCount(n + 1);
        fv.setFaceVectorData(vectorToJson(current));
    }


    // ──── Vector/BBox 파싱 & 유틸 ────────────────────────────────────────────────

    private double[] parseVector(String json) {
        // e.g. "[0.12, -0.34, …]" 형태 → double[]
        String body = json.replaceAll("[\\[\\]\\s]", "");
        String[] parts = body.split(",");
        double[] arr = new double[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Double.parseDouble(parts[i]);
        }
        return arr;
    }

    private String vectorToJson(double[] arr) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            sb.append(arr[i]);
            if (i < arr.length-1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private int[] parseBbox(String json) {
        // e.g. "[x1,y1,x2,y2]"
        String body = json.replaceAll("[\\[\\]\\s]", "");
        String[] parts = body.split(",");
        return new int[]{
                (int)Math.round(Double.parseDouble(parts[0])),
                (int)Math.round(Double.parseDouble(parts[1])),
                (int)Math.round(Double.parseDouble(parts[2])),
                (int)Math.round(Double.parseDouble(parts[3]))
        };
    }

    private double cosineSimilarity(double[] v1, double[] v2) {
        double dot=0, n1=0, n2=0;
        for (int i=0; i<v1.length; i++){
            dot += v1[i]*v2[i];
            n1  += v1[i]*v1[i];
            n2  += v2[i]*v2[i];
        }
        return dot / (Math.sqrt(n1)*Math.sqrt(n2));
    }
}