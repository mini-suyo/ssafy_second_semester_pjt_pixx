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
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URL;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

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
        // 1) FastAPI 호출 & face_detection 저장
        String url = faceApiUrl + "/api/v1/detect/" + imageId;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<FaceApiDtos.DetectRequest> req =
                new HttpEntity<>(new FaceApiDtos.DetectRequest(imgUrl), headers);

        FaceApiDtos.DetectResponse body;
        try {
            ResponseEntity<FaceApiDtos.DetectResponse> resp =
                    restTemplate.exchange(url, HttpMethod.POST, req, FaceApiDtos.DetectResponse.class);
            if (resp.getBody() == null) {
                throw new CustomException(500, "얼굴 검출 API 응답이 비어 있습니다.");
            }
            body = resp.getBody();
            if (body.getStatus() != 200) {
                throw new CustomException(400, "얼굴 검출 실패: " + body.getMessage());
            }
        } catch (HttpClientErrorException.BadRequest ex) {
            throw new CustomException(400, "이미지 불러오기 실패: " + ex.getResponseBodyAsString(), ex);
        } catch (HttpClientErrorException ex) {
            throw new CustomException(ex.getStatusCode().value(),
                    "얼굴 검출 API 오류: " + ex.getStatusText(), ex);
        } catch (ResourceAccessException ex) {
            throw new CustomException(400, "얼굴 검출 서버 호출 실패: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            throw new CustomException(500, "얼굴 검출 서버 내부 오류", ex);
        }

        // 2) face_detection 테이블에 저장
        Image image = imageRepo.findById(imageId)
                .orElseThrow(() -> new CustomException(404, "이미지를 찾을 수 없습니다: " + imageId));
        for (FaceApiDtos.FaceDetectDto dto : body.getData()) {
            FaceDetection det = FaceDetection.builder()
                    .image(image)
                    .boundingBox(dto.getBoundingBox().toString())
                    .detectionVectorData(dto.getVectorData().toString())
                    .valid(true)
                    .build();
            detectionRepo.save(det);
        }

        // 3) 클러스터링 & 썸네일 생성
        List<FaceDetection> newDets =
                detectionRepo.findByFaceVectorIsNullAndValidTrueAndImage_ImageId(imageId);

        for (FaceDetection det : newDets) {
            FaceVector best = findBestMatch(det);
            if (best != null) {
                // ─ 기존 클러스터에 합치기 ─
                det.setFaceVector(best);
                updateCentroid(best, det);
                vectorRepo.save(best);
            } else {
                // 신규 클러스터 & 썸네일 생성
                FaceVector fv = FaceVector.builder()
                        .user(det.getImage().getFeed().getUser())
                        .faceVectorData(det.getDetectionVectorData())
                        .detectionCount(1)
                        .repDetection(det)
                        .build();

                // 바운딩 박스 기반 크롭 → 썸네일 S3 업로드
                String userId = String.valueOf(det.getImage().getFeed().getUser().getUserId());
                String s3Key = uploadThumbnailToS3(
                        imgUrl,
                        det.getBoundingBox(),
                        userId
                );

                // 썸네일 세팅 후에야 한 번만 save()
                fv.updateFaceThumbnail(s3Key);
                vectorRepo.save(fv);

                // face_detection 에 연관짓고 저장
                det.setFaceVector(fv);
            }
            detectionRepo.save(det);
        }

        // 4) 결과 DTO 반환
        return body.getData();
    }

    @Async
    @Transactional
    public CompletableFuture<Void> processImageAsync(Integer imageId, String imgUrl) {
        processImage(imageId, imgUrl);
        return CompletableFuture.completedFuture(null);
    }

    /** 클러스터 이름 변경 (face_cluster_name) */
    @Transactional
    public void updateClusterName(Integer faceId, String clusterName) {
        FaceVector fv = vectorRepo.findById(faceId)
                .orElseThrow(() -> new CustomException(400, "클러스터를 찾을 수 없습니다: " + faceId));
        fv.setFaceClusterName(clusterName);
        vectorRepo.save(fv);
    }

    /** 잘못된 검출 무효화 */
    @Transactional
    public void invalidateDetection(Integer detectionId) {
        FaceDetection det = detectionRepo.findById(detectionId)
                .orElseThrow(() -> new CustomException(400, "검출 레코드를 찾을 수 없습니다: " + detectionId));
        det.setValid(false);
        detectionRepo.save(det);
    }

    /**
     * 지정된 faceId 의 FaceVector(클러스터) 와 연관된 FaceDetection 들을 모두 삭제
     */
    @Transactional
    public void deleteFace(Integer faceId) {
        FaceVector fv = vectorRepo.findById(faceId)
                .orElseThrow(() -> new CustomException(400, "삭제할 얼굴을 찾을 수 없습니다: " + faceId));
        // cascade 삭제가 걸려있다면 연관 FaceDetection 도 함께 삭제됩니다.
        vectorRepo.delete(fv);
    }

    // ────────────────────────────────────────────────────────────────────────────────
    // 헬퍼 메서드
    // ────────────────────────────────────────────────────────────────────────────────

    /**
     * 주어진 이미지 URL과 바운딩박스(JSON)으로부터
     * - 원본 bbox를 20% 확장한 정사각형 영역을 크롭하고
     * - 1:1 비율(150×150) 썸네일로 리사이즈하여 S3에 업로드 후 key 반환
     */
    private String uploadThumbnailToS3(String imageUrl, String bboxJson, String userId) {
        try {
            BufferedImage original = ImageIO.read(new URL(imageUrl));

            // 1) 원본 bbox 파싱
            int[] box = parseBbox(bboxJson);
            int x1 = box[0], y1 = box[1];
            int x2 = box[2], y2 = box[3];

            // 2) bbox 중심/크기 계산
            int bw = x2 - x1;
            int bh = y2 - y1;
            int baseSize = Math.min(bw, bh);
            double expandRatio = 1.3;  // 20% 확장
            int expandedSize = (int)(baseSize * expandRatio);

            int centerX = x1 + bw / 2;
            int centerY = y1 + bh / 2;

            // 3) 확장된 정사각형의 좌상단 좌표
            int cropX = centerX - expandedSize / 2;
            int cropY = centerY - expandedSize / 2;

            // 4) 이미지 범위(clamp) 체크
            cropX = Math.max(0, Math.min(cropX, original.getWidth() - expandedSize));
            cropY = Math.max(0, Math.min(cropY, original.getHeight() - expandedSize));

            // 5) 크롭 & 썸네일 생성
            BufferedImage squareCrop = original.getSubimage(
                    cropX, cropY,
                    expandedSize, expandedSize
            );
            int thumbSize = 150;  // 최종 썸네일 사이즈 (px)
            BufferedImage thumb = Thumbnails.of(squareCrop)
                    .size(thumbSize, thumbSize)
                    .outputQuality(0.8)
                    .asBufferedImage();

            // 6) 바이트 변환 및 S3 업로드
            ByteArrayOutputStream os = new ByteArrayOutputStream();
            ImageIO.write(thumb, "jpg", os);
            byte[] bytes = os.toByteArray();

            String filename = UUID.randomUUID() + ".jpg";
            String keyInFolder = "users/" + userId + "/thumbnail/" + filename;

            return s3Uploader.uploadThumbnail(
                    Integer.parseInt(userId),
                    new ByteArrayInputStream(bytes),
                    keyInFolder,
                    "image/jpeg",
                    (long) bytes.length
            );
        } catch (IOException e) {
            throw new CustomException(500, "썸네일 생성 및 업로드 실패", e);
        }
    }

    // ─── 유틸 메서드들 ────────────────────────────────────────────────────────

    private int[] parseBbox(String json) {
        String body = json.replaceAll("[\\[\\]\\s]", "");
        String[] parts = body.split(",");
        return new int[]{
                (int)Math.round(Double.parseDouble(parts[0])),
                (int)Math.round(Double.parseDouble(parts[1])),
                (int)Math.round(Double.parseDouble(parts[2])),
                (int)Math.round(Double.parseDouble(parts[3]))
        };
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
        double[] add = parseVector(det.getDetectionVectorData());
        int n = fv.getDetectionCount();
        for (int i = 0; i < current.length; i++) {
            current[i] = (current[i] * n + add[i]) / (n + 1);
        }
        fv.setDetectionCount(n + 1);
        fv.setFaceVectorData(vectorToJson(current));
    }


    // ──── Vector/BBox 파싱 & 유틸 ────────────────────────────────────────────────

    private double[] parseVector(String json) {
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
            if (i < arr.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private double cosineSimilarity(double[] v1, double[] v2) {
        double dot = 0, n1 = 0, n2 = 0;
        for (int i = 0; i < v1.length; i++) {
            dot += v1[i] * v2[i];
            n1 += v1[i] * v1[i];
            n2 += v2[i] * v2[i];
        }
        return dot / (Math.sqrt(n1) * Math.sqrt(n2));
    }
}
