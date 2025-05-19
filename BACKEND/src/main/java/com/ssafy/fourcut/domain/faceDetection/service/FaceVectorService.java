package com.ssafy.fourcut.domain.faceDetection.service;

import com.ssafy.fourcut.domain.faceDetection.dto.*;
import com.ssafy.fourcut.domain.faceDetection.entity.FaceDetection;
import com.ssafy.fourcut.domain.faceDetection.entity.FaceVector;
import com.ssafy.fourcut.domain.faceDetection.repository.FaceDetectionRepository;
import com.ssafy.fourcut.domain.faceDetection.repository.FaceVectorRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaceVectorService {
    private final FaceDetectionRepository detectionRepo;
    private final FaceVectorRepository vectorRepo;
    private final FeedRepository feedRepo;
    private final ImageRepository imageRepo;
    private final CloudFrontService cloudFrontService;

    public FaceListResponseDto getFaceList(Integer userId, FaceListRequestDto req) {
        Sort sort = (req.getType() == 0)
                ? Sort.by("createdAt").descending()
                : Sort.by("createdAt").ascending();

        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);
        Page<FaceVector> page = vectorRepo.findByUser_UserId(userId, pageable);

        List<FaceListItemDto> list = page.stream()
                .filter(fv -> fv.getDetectionCount() >= 2)
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

        // 2) feedId 중복 제거
        List<Integer> feedIds = dets.stream()
                .map(det -> det.getImage().getFeed().getFeedId())
                .distinct()
                .collect(Collectors.toList());

        // 3) 페이징·정렬 설정
        Sort sort = req.getType() == 0
                ? Sort.by("feedDate").descending()
                : Sort.by("feedDate").ascending();
        Pageable pageable = PageRequest.of(req.getPage(), req.getSize(), sort);

        // 4) Feed 조회 (본인 유저의 feed 에 한정)
        Page<?> page = feedRepo.findByFeedIdInAndUser_UserId(feedIds, userId, pageable);

        // 5) DTO 변환
        List<FaceFeedItemDto> items = ((Page<com.ssafy.fourcut.domain.image.entity.Feed>)page).stream()
                .map(feed -> {
                    // feed 에 연결된 대표 이미지(IMAGE 타입) 하나
                    Image thumb = imageRepo
                            .findFirstByFeed_FeedIdAndImageTypeOrderByImageIdAsc(feed.getFeedId(), ImageType.IMAGE)
                            .orElse(null);

                    String url = thumb == null
                            ? null
                            : cloudFrontService.generateSignedCloudFrontUrl(thumb.getImageUrl(), "get");

                    return FaceFeedItemDto.builder()
                            .feedId(feed.getFeedId())
                            .feedThumbnailImgUrl(url)
                            .feedFavorite(feed.getFeedFavorite())
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