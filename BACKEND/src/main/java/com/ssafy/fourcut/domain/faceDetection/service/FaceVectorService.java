package com.ssafy.fourcut.domain.faceDetection.service;

import com.ssafy.fourcut.domain.faceDetection.dto.*;
import com.ssafy.fourcut.domain.faceDetection.entity.FaceDetection;
import com.ssafy.fourcut.domain.faceDetection.entity.FaceVector;
import com.ssafy.fourcut.domain.faceDetection.repository.FaceDetectionRepository;
import com.ssafy.fourcut.domain.faceDetection.repository.FaceVectorRepository;
import com.ssafy.fourcut.domain.image.entity.Feed;
import com.ssafy.fourcut.domain.image.entity.Image;
import com.ssafy.fourcut.domain.image.entity.enums.ImageType;
import com.ssafy.fourcut.domain.image.repository.FeedRepository;
import com.ssafy.fourcut.domain.image.repository.ImageRepository;
import com.ssafy.fourcut.domain.image.service.CloudFrontService;
import com.ssafy.fourcut.global.exception.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaceVectorService {
    private final FaceDetectionRepository detectionRepo;
    private final FaceVectorRepository vectorRepo;
    private final FeedRepository feedRepo;
    private final ImageRepository imageRepo;
    private final CloudFrontService cloudFrontService;

    // 2) Service 코드 수정
    public FaceListResponseDto getFaceList(Integer userId, FaceListRequestDto req) {
        Sort sort = (req.getType() == 0)
                ? Sort.by("createdAt").descending()
                : Sort.by("createdAt").ascending();

        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);

        // 변경된 부분: 페이징 전에 DB 레벨에서 detectionCount>=2 필터링
        Page<FaceVector> page = vectorRepo
                .findByUser_UserIdAndDetectionCountGreaterThanEqual(userId, 2, pageable);

        List<FaceListItemDto> list = page.stream()
                .map(fv -> new FaceListItemDto(
                        fv.getFaceId(),
                        fv.getFaceClusterName() != null ? fv.getFaceClusterName() : "Unknown",
                        cloudFrontService.generateSignedCloudFrontUrl(fv.getFaceThumbnail(), "get"),
                        fv.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new FaceListResponseDto(list);
    }

    public FaceFeedDetailDto getFeedsByFace(Integer userId, Integer faceId, FaceFeedRequestDto req) {
        // 1) face_detection 에서 해당 faceId 로 연관된 검출들 읽기
        List<FaceDetection> dets = detectionRepo.findByFaceVector_FaceIdAndValidTrue(faceId);
        if (dets.isEmpty()) {
            throw new CustomException(400, "해당 얼굴로 저장된 피드가 없습니다.");
        }

        // 1-1) detection 들을 feedId 별로 묶어두기
        Map<Integer, List<FaceDetection>> detsByFeedId =
                dets.stream()
                        .collect(Collectors.groupingBy(det -> det.getImage().getFeed().getFeedId()));

        // 2) feedId 중복 제거
        List<Integer> feedIds = detsByFeedId.keySet().stream().collect(Collectors.toList());

        // 3) 페이징·정렬 설정
        Sort sort = req.getType() == 0
                ? Sort.by("feedDate").descending()
                : Sort.by("feedDate").ascending();
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);

        // 4) Feed 조회 (본인 유저의 feed 에 한정)
        Page<Feed> page = feedRepo.findByFeedIdInAndUser_UserId(feedIds, userId, pageable);

        // 5) DTO 변환: detectionIds 도 함께 담아줌
        List<FaceFeedItemDto> items = page.stream()
                .map(feed -> {
                    // feed 에 연결된 대표 이미지 하나 가져오기
                    Image thumb = imageRepo
                            .findFirstByFeed_FeedIdAndImageTypeOrderByImageIdAsc(feed.getFeedId(), ImageType.IMAGE)
                            .orElse(null);

                    String url = thumb == null
                            ? null
                            : cloudFrontService.generateSignedCloudFrontUrl(thumb.getImageUrl(), "get");

                    // 이 피드에 해당하는 detection_id 목록
                    List<Integer> detectionIds = detsByFeedId.getOrDefault(feed.getFeedId(), List.of())
                            .stream()
                            .map(FaceDetection::getDetectionId)
                            .collect(Collectors.toList());

                    return FaceFeedItemDto.builder()
                            .feedId(feed.getFeedId())
                            .feedThumbnailImgUrl(url)
                            .feedFavorite(feed.getFeedFavorite())
                            .detectionIds(detectionIds)    // 새로 추가된 필드
                            .build();
                })
                .collect(Collectors.toList());

        // 6) faceName 얻기
        FaceVector fv = vectorRepo.findById(faceId)
                .orElseThrow(() -> new CustomException(400, "FaceVector를 찾을 수 없습니다: " + faceId));

        String faceName = fv.getFaceClusterName() != null
                ? fv.getFaceClusterName()
                : "Unknown";

        return FaceFeedDetailDto.builder()
                .faceName(faceName)
                .faceFeedList(items)
                .build();
    }
}