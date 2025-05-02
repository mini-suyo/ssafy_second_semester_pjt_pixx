package com.ssafy.fourcut.domain.image.service;

import com.ssafy.fourcut.domain.image.entity.Album;
import com.ssafy.fourcut.domain.image.entity.Brand;
import com.ssafy.fourcut.domain.image.entity.Feed;
import com.ssafy.fourcut.domain.image.dto.StoreRequestDto;
import com.ssafy.fourcut.domain.image.entity.Image;
import com.ssafy.fourcut.domain.image.entity.enums.ImageType;
import com.ssafy.fourcut.domain.image.repository.AlbumRepository;
import com.ssafy.fourcut.domain.image.repository.BrandRepository;
import com.ssafy.fourcut.domain.image.repository.FeedRepository;
import com.ssafy.fourcut.domain.image.repository.StoreRepository;
import com.ssafy.fourcut.domain.user.entity.User;
import com.ssafy.fourcut.domain.user.repository.UserRepository;
import com.ssafy.fourcut.global.s3.S3Uploader;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.UUID;

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
    public int createFeed(StoreRequestDto request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("해당 userId가 존재하지 않습니다."));
        Album album = albumRepository.findByUser_UserIdAndDefaultAlbumTrue(user.getUserId())
                .orElseThrow(() -> new IllegalStateException("Default album not found"));
        Brand brand = brandRepository.findById(1)
                .orElseThrow(() -> new IllegalStateException("Brand not found"));
        Feed feed = Feed.builder()
                .user(user)
                .album(album)
                .brand(brand)
                .feedFavorite(false)
                .feedLocation("인원을 입력해주세요")
                .feedMemo("메모를 작성해주세요")
                .feedPopulation(null)
                .feedTitle("제목을 작성해주세요")
                .build();

        Feed savedFeed = feedRepository.save(feed);
        return savedFeed.getFeedId();
    }

    /*
     * 받은 URL을 크롤링하여 파일들을 다운로드한다.
     */
    @Transactional
    public void CrawlUploadAndSave(StoreRequestDto request, String downloadPath) {
        try {
            // 1. feed 찾기
            Feed feed = feedRepository.findById(request.getFeedId())
                    .orElseThrow(() -> new IllegalArgumentException("Feed를 찾을 수 없습니다."));

            // 2. 메인 페이지 HTML 파싱
            Document doc = Jsoup.connect(request.getPageUrl()).get();

            // 3. <a> 태그 전부 가져오기
            Elements links = doc.select("a");

            for (Element link : links) {
                String href = link.absUrl("href");
//                String href = link.attr("href");
                if (href.contains(downloadPath)) {   // download.php 링크만
                    uploadAndSave(request.getUserId(), href, feed);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("크롤링 및 다운로드 실패", e);
        }
    }

    /*
     * S3 업로드 및 DB 저장을 한다.
     */
    private void uploadAndSave(int userId, String fileUrl, Feed feed) {
        try {
            URL url = new URL(fileUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            String contentType = connection.getContentType();
            String extension = getExtensionByContentType(contentType);
            String originalFilename = UUID.randomUUID().toString() + extension;

            try (InputStream inputStream = connection.getInputStream()) {
                String s3Key = s3Uploader.upload(userId, inputStream, originalFilename, contentType);

                storeRepository.save(
                        Image.builder()
                                .feed(feed)
                                .imageUrl(s3Key)
                                .imageType(detectImageType(contentType))
                                .createdAt(LocalDateTime.now())
                                .build()
                );
            }
        } catch (Exception e) {
            throw new RuntimeException("파일 다운로드 및 업로드 실패", e);
        }
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

    private ImageType detectImageType(String contentType) {
        if (contentType.startsWith("image/")) {
            if (contentType.equals("image/gif")) return ImageType.GIF;
            else return ImageType.IMAGE;
        }
        if (contentType.startsWith("video/")) return ImageType.VIDEO;
        throw new IllegalArgumentException("알 수 없는 파일 타입: " + contentType);
    }
}