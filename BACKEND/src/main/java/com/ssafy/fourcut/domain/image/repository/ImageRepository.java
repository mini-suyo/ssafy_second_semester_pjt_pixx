package com.ssafy.fourcut.domain.image.repository;

import com.ssafy.fourcut.domain.image.entity.Image;
import com.ssafy.fourcut.domain.image.entity.enums.ImageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Integer> {
    List<Image> findByFeed_FeedId(Integer feedId);
    Optional<Image> findFirstByFeed_FeedIdAndImageTypeOrderByImageIdAsc(
            Integer feedId,
            ImageType imageType
    );
}
