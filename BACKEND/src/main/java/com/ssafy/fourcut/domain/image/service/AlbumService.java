// src/main/java/com/ssafy/fourcut/domain/image/service/AlbumService.java
package com.ssafy.fourcut.domain.image.service;

import com.ssafy.fourcut.domain.image.dto.*;
import com.ssafy.fourcut.domain.image.entity.*;
import com.ssafy.fourcut.domain.image.repository.AlbumRepository;
import com.ssafy.fourcut.domain.image.repository.FeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final FeedRepository feedRepository;

    public FeedAlbumResponse getFeedAlbum(Integer userId) {
        List<Album> albums = albumRepository.findByUserUserId(userId);

        List<AlbumResponse> dtoList = albums.stream()
                .map(album -> {
                    // feeds 컬렉션에서 가장 오래된 feedDate 뽑기
                    LocalDateTime oldestDate = album.getFeeds().stream()
                            .map(Feed::getFeedDate)
                            .min(Comparator.naturalOrder())
                            .orElse(null);

                    return new AlbumResponse(
                            album.getAlbumId(),
                            album.getAlbumName(),
                            oldestDate
                    );
                })
                .collect(Collectors.toList());

        return new FeedAlbumResponse(dtoList);
    }

    public AlbumDetailResponse getAlbumDetail(
            Integer userId,
            Integer albumId,
            int type,
            int page,
            int size
    ) {
        // 1) 앨범 존재 및 소유자 확인
        Album album = albumRepository.findById(albumId)
                .orElseThrow(() -> new EntityNotFoundException("앨범이 없습니다. id=" + albumId));
        if (!album.getUser().getUserId().equals(userId)) {
            throw new EntityNotFoundException("해당 사용자의 앨범이 아닙니다.");
        }

        // 2) albumDate 계산 (가장 오래된 피드 한 건)
        Feed oldestFeed = feedRepository
                .findTop1ByAlbumAlbumIdOrderByFeedDateAsc(albumId);
        LocalDateTime albumDate = (oldestFeed != null)
                ? oldestFeed.getFeedDate()
                : null;

        // 3) 페이지 요청 생성
        PageRequest pr = PageRequest.of(page, size);

        // 4) 피드 페이징 조회 (정렬: type==0 최신, type==1 오래된)
        Page<Feed> feedPage = (type == 0)
                ? feedRepository.findByAlbumAlbumIdOrderByFeedDateDesc(albumId, pr)
                : feedRepository.findByAlbumAlbumIdOrderByFeedDateAsc(albumId, pr);

        // 5) Feed → FeedItemResponse 매핑
        List<FeedItemResponse> feedItems = feedPage.stream()
                .map(f -> {
                    String thumb = f.getImages().stream()
                            .findFirst()
                            .map(Image::getImageUrl)
                            .orElse("");
                    return new FeedItemResponse(
                            f.getFeedId(),
                            thumb,
                            f.getFeedFavorite()
                    );
                })
                .collect(Collectors.toList());

        return new AlbumDetailResponse(
                album.getAlbumId(),
                album.getAlbumName(),
                albumDate,
                album.getAlbumMemo(),
                feedItems
        );
    }
}
