package com.ssafy.fourcut.domain.image.service;

import com.ssafy.fourcut.domain.image.dto.FileUploadRequestDto;
import com.ssafy.fourcut.domain.image.entity.Album;
import com.ssafy.fourcut.domain.image.entity.Brand;
import com.ssafy.fourcut.domain.image.entity.Feed;
import com.ssafy.fourcut.domain.image.dto.QRUploadRequestDto;
import com.ssafy.fourcut.domain.image.entity.Image;
import com.ssafy.fourcut.domain.image.entity.enums.ImageType;
import com.ssafy.fourcut.domain.image.repository.AlbumRepository;
import com.ssafy.fourcut.domain.image.repository.BrandRepository;
import com.ssafy.fourcut.domain.image.repository.FeedRepository;
import com.ssafy.fourcut.domain.image.repository.StoreRepository;
import com.ssafy.fourcut.domain.user.entity.User;
import com.ssafy.fourcut.domain.user.repository.UserRepository;
import com.ssafy.fourcut.global.exception.CustomException;
import com.ssafy.fourcut.global.s3.S3Uploader;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StoreService {

    private final UserRepository userRepository;
    private final FeedRepository feedRepository;
    private final AlbumRepository albumRepository;
    private final BrandRepository brandRepository;
    private final StoreRepository storeRepository;
    private final S3Uploader s3Uploader;

    /*
     * feed 테이블을 새로 만든다.
     */
    @Transactional
    public int createFeed(int userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(404, "해당 userId가 존재하지 않습니다."));
        log.info("userId : " + user.getUserId());
        Album album = albumRepository.findByUser_UserIdAndDefaultAlbumTrue(user.getUserId())
                .orElseThrow(() -> new CustomException(404, "기본 앨범을 찾을 수 없습니다."));
        log.info("album : " + album.getAlbumId());
        Brand brand = brandRepository.findById(1)
                .orElseThrow(() -> new CustomException(404, "기본 브랜드를 찾을 수 없습니다."));
        Feed feed = Feed.builder()
                .user(user)
                .album(album)
                .brand(brand)
                .feedFavorite(false)
                .build();

        Feed savedFeed = feedRepository.save(feed);
        return savedFeed.getFeedId();
    }

    /*
     * 각 브랜드에 맞춰, brandId를 수정한다.
     */
    private void updateBrand(Feed feed, int brandId, String logMessage) {
        log.info(logMessage);
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new CustomException(404, "해당 브랜드(" + brandId + ")를 찾을 수 없습니다."));
        feed.setBrand(brand);
        feedRepository.save(feed);
    }

    /*
     * 받은 URL을 크롤링하여 파일들을 다운로드하여 S3에 저장한다.
     */
    @Transactional
    public void CrawlUploadAndSave(QRUploadRequestDto request) {
        try {
            Feed feed = feedRepository.findById(request.getFeedId())
                    .orElseThrow(() -> new CustomException(404, "Feed를 찾을 수 없습니다."));

            // 브랜드 별 크롤링 메서드 호출
            if (request.getPageUrl().contains("monomansion.net")) {
                updateBrand(feed, 2, "모노맨션 크롤링");
                crawlMonomansion(request);
            } else if (request.getPageUrl().contains("haru")) {
                updateBrand(feed, 3, "하루필름 크롤링");
                crawlharu(request);
            } else if (request.getPageUrl().contains("seobuk.kr")) {
                updateBrand(feed, 4, "포토이즘 크롤링");
                crawlPhotoism(request);
            } else if (request.getPageUrl().contains("life4cut.net")) {
                updateBrand(feed, 5, "인생네컷 크롤링");
                crawlLife4cut(request);
            } else {
                throw new CustomException(400, "지원하지 않는 브랜드입니다.");
            }
        } catch (CustomException e) {
            feedRepository.deleteById(request.getFeedId());
            throw e;
        } catch (Exception e) {
            feedRepository.deleteById(request.getFeedId());
            throw new CustomException(500, "크롤링 및 다운로드 중 오류가 발생했습니다.");
        }
    }

    // 모노맨션 크롤링
    private void crawlMonomansion(QRUploadRequestDto request) throws Exception {
        Feed feed = feedRepository.findById(request.getFeedId())
                .orElseThrow(() -> new CustomException(404, "Feed를 찾을 수 없습니다."));

        Document doc = Jsoup.connect(request.getPageUrl()).get();
        Elements links = doc.select("a");

        for (Element link : links) {
            String href = link.absUrl("href");
            if (href.contains("download.php")) {
                QRuploadAndSave(request.getUserId(), href, feed);
            }
        }
    }
    
    // 하루필름 크롤링
    private void crawlharu(QRUploadRequestDto request) throws Exception {
        Feed feed = feedRepository.findById(request.getFeedId())
                .orElseThrow(() -> new CustomException(404, "Feed를 찾을 수 없습니다."));

        String redirectedUrl = resolveRedirectUrl(request.getPageUrl());
        log.info("리다이렉트 최종 URL: {}", redirectedUrl);

        Document doc = Jsoup.connect(redirectedUrl).get();
        Elements links = doc.select("a");

        for (Element link : links) {
            String href = link.absUrl("href");
            if (href.contains("base_api")) {
                QRuploadAndSave(request.getUserId(), href, feed);
            }
        }
    }

    // 포토이즘 크롤링
    private void crawlPhotoism(QRUploadRequestDto request) throws Exception {
        Feed feed = feedRepository.findById(request.getFeedId())
                .orElseThrow(() -> new CustomException(404, "Feed를 찾을 수 없습니다."));

        String redirectedUrl = resolveRedirectUrl(request.getPageUrl());
        log.info("리다이렉트 최종 URL: {}", redirectedUrl);

        // 1. uid 파라미터 추출
        String uid = extractUidFromUrl(request.getFeedId(), redirectedUrl);
        log.info("uid : " + uid);

        // 2. POST 요청 보내기
        URL apiUrl = new URL("https://cmsapi.seobuk.kr/v1/etc/seq/resource");
        HttpURLConnection conn = (HttpURLConnection) apiUrl.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        String payload = "{\"uid\":\"" + uid + "\"}";
        log.info("payload : " + payload);
        conn.getOutputStream().write(payload.getBytes());

        // 3. 응답 JSON 파싱
        String response = new String(conn.getInputStream().readAllBytes());
        JSONObject json = new JSONObject(response);
        JSONObject fileInfo = json.getJSONObject("content").getJSONObject("fileInfo");

        // 4. path 추출
        String imagePath = fileInfo.getJSONObject("picFile").getString("path");
        String videoPath = fileInfo.getJSONObject("vidFile").getString("path");

        log.info("포토이즘 ImagePath : " + imagePath);
        log.info("포토이즘 VideoPath : " +  videoPath);

        // 5. S3 업로드 및 DB 저장
        QRuploadAndSave(request.getUserId(), imagePath, feed);
        QRuploadAndSave(request.getUserId(), videoPath, feed);
    }

    // 인생네컷 크롤링
    private void crawlLife4cut(QRUploadRequestDto request) throws Exception {
        Feed feed = feedRepository.findById(request.getFeedId())
                .orElseThrow(() -> new CustomException(404, "Feed를 찾을 수 없습니다."));

        // 리다이렉트 추적해서 최종 URL 얻기
        String redirectedUrl = resolveRedirectUrl(request.getPageUrl());
        log.info("리다이렉트 최종 URL: {}", redirectedUrl);

        // 1. folderPath 파라미터 추출
        String folderPath = extractQueryParam(redirectedUrl, "folderPath");  // "/QRimage/20250508/770/UUID"

        // 2. 경로에서 각 구성 요소 추출
        String[] parts = folderPath.split("/");
        if (parts.length < 5) {
            throw new CustomException(400, "folderPath 형식이 올바르지 않습니다.");
        }

        String folder = parts[2];
        String boothId = parts[3];
        String uuid = parts[4];

        // 3. 파일 URL 구성
        String basePath = "https://release-renewal-s3.s3.ap-northeast-2.amazonaws.com/QRimage";
        String imageUrl = String.format("%s/%s/%s/%s/image.jpg", basePath, folder, boothId, uuid);
        String videoUrl = String.format("%s/%s/%s/%s/video.mp4", basePath, folder, boothId, uuid);

        // 4. 인코딩해서 life4cut 프록시로 요청
        String imageDownloadUrl = "https://download.life4cut.net/api/download?url=" + URLEncoder.encode(imageUrl, "UTF-8");
        String videoDownloadUrl = "https://download.life4cut.net/api/download?url=" + URLEncoder.encode(videoUrl, "UTF-8");

        log.info("인생네컷 이미지: " + imageDownloadUrl);
        log.info("인생네컷 비디오: " + videoDownloadUrl);

        // 5. 다운로드 후 업로드
        QRuploadAndSave(request.getUserId(), imageDownloadUrl, feed);
        QRuploadAndSave(request.getUserId(), videoDownloadUrl, feed);
    }

    private String resolveRedirectUrl(String originalUrl) throws Exception {
        HttpURLConnection conn = (HttpURLConnection) new URL(originalUrl).openConnection();
        conn.setInstanceFollowRedirects(false); // 수동으로 리다이렉트 추적
        conn.setRequestMethod("GET");
        conn.connect();

        int responseCode = conn.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_MOVED_TEMP || responseCode == HttpURLConnection.HTTP_MOVED_PERM) {
            String redirectUrl = conn.getHeaderField("Location");
            return redirectUrl;
        } else {
            throw new CustomException(500, "리다이렉트 응답이 아닙니다. 응답코드: " + responseCode);
        }
    }


    private String extractUidFromUrl(int feedId, String url) {
        int idx = url.indexOf("u=");
        if (idx == -1) {
            feedRepository.deleteById(feedId);
            throw new CustomException(400, "uid 파라미터가 URL에 없습니다.");
        }
        return url.substring(idx + 2);
    }

    /*
     * QR 관련 S3 및 DB 저장 메서드
     * S3 업로드 및 DB 저장을 한다.
     */
    private void QRuploadAndSave(int userId, String fileUrl, Feed feed) {
        try {
            URL url = new URL(fileUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            try (InputStream inputStream = connection.getInputStream()) {

                String contentType = connection.getContentType();
                long contentLength = connection.getContentLengthLong();

                // 2. contentType이 부정확한 경우 확장자 추출해서 보정
                String extension;
                if ("application/octet-stream".equals(contentType)) {
                    extension = getExtensionFromUrl(fileUrl);
                    contentType = detectContentTypeFromExtension(extension);
                } else {
                    extension = getExtensionByContentType(contentType);
                }

//                String extension = getExtensionByContentType(contentType);
                String originalFilename = UUID.randomUUID().toString() + extension;
                String s3Key = s3Uploader.upload(userId, inputStream, originalFilename, contentType, contentLength);

                boolean isThumbnail = isImageTypeForThumbnail(extension); // 사진인 경우 : true, 아닐 경우, false

                storeRepository.save(
                        Image.builder()
                                .feed(feed)
                                .imageUrl(s3Key)
                                .imageType(detectImageType(feed.getFeedId(), contentType))
                                .createdAt(LocalDateTime.now())
                                .isThumbnail(isThumbnail)
                                .build()
                );
            }
        } catch (Exception e) {
            log.error("QRuploadAndSave 실패 - URL: {}", fileUrl, e);
            feedRepository.deleteById(feed.getFeedId());
            throw new CustomException(500, "파일 다운로드 및 S3 업로드 중 오류가 발생했습니다.");
        }
    }

    private boolean isImageTypeForThumbnail(String extension) {
        if (extension == null) return false;
        String ext = extension.toLowerCase();
        return ext.equals(".jpg") || ext.equals(".jpeg") || ext.equals(".png") || ext.equals(".webp");
    }


    private String getExtensionByContentType(String contentType) {
        if (contentType == null) return "";

        switch (contentType) {
            case "image/jpeg": return ".jpg";
            case "image/png": return ".png";
            case "image/gif": return ".gif";
            case "video/mp4": return ".mp4";
            default: return ".bin"; // 알 수 없는 경우
        }
    }

    private ImageType detectImageType(int feedId, String contentType) {
        if (contentType.startsWith("image/")) {
            if (contentType.equals("image/gif")) return ImageType.GIF;
            else return ImageType.IMAGE;
        }
        if (contentType.startsWith("video/")) return ImageType.VIDEO;
        feedRepository.deleteById(feedId);
        throw new CustomException(500, "알 수 없는 파일 타입: " + contentType);
    }


    // 포토이즘 관련
    private String getExtensionFromUrl(String fileUrl) {
        if (fileUrl.endsWith(".jpg")) return ".jpg";
        if (fileUrl.endsWith(".png")) return ".png";
        if (fileUrl.endsWith(".gif")) return ".gif";
        if (fileUrl.endsWith(".mp4")) return ".mp4";
        return ".bin";
    }

    private String detectContentTypeFromExtension(String extension) {
        switch (extension) {
            case ".jpg": return "image/jpeg";
            case ".png": return "image/png";
            case ".gif": return "image/gif";
            case ".mp4": return "video/mp4";
            default: return "application/octet-stream";
        }
    }

    // 인생네컷 관련
    private String extractQueryParam(String url, String key) throws Exception {
        String[] queryParts = url.split("\\?");
        if (queryParts.length < 2) return null;

        String[] params = queryParts[1].split("&");
        for (String param : params) {
            String[] pair = param.split("=");
            if (pair.length == 2 && pair[0].equals(key)) {
                return URLDecoder.decode(pair[1], "UTF-8");
            }
        }
        return null;
    }

    /*
     * 받은 파일들을 S3에 저장한다.
     */
    public void uploadFile(FileUploadRequestDto request, List<MultipartFile> files) {
        int userId = request.getUserId();

        // Feed 엔티티 조회 또는 생성 필요
        Feed feed = feedRepository.findById(request.getFeedId())
                .orElseThrow(() -> new CustomException(404, "해당 피드(" + request.getFeedId() + ")를 찾을 수 없습니다."));

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            try (InputStream inputStream = file.getInputStream()) {
                String contentType = file.getContentType();
                String extension = getExtensionByContentType(contentType);

                String originalFilename = UUID.randomUUID().toString() + extension;
                String s3Key = s3Uploader.upload(userId, inputStream, originalFilename, contentType, file.getSize());

                storeRepository.save(
                        Image.builder()
                                .feed(feed)
                                .imageUrl(s3Key)
                                .imageType(detectImageType(feed.getFeedId(), contentType)) // photo, gif, video 등
                                .createdAt(LocalDateTime.now())
                                .isThumbnail(i == 0)  // 첫 번째 파일만 true
                                .build()
                );

            } catch (Exception e) {
                feedRepository.deleteById(feed.getFeedId());
                throw new CustomException(500, "파일 업로드 실패: " + file.getOriginalFilename());
            }
        }
    }
}