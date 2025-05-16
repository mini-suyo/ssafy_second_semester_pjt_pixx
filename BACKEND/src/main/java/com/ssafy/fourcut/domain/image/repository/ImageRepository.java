package com.ssafy.fourcut.domain.image.repository;

import com.ssafy.fourcut.domain.image.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Integer> {
    List<Image> findByFeed_FeedId(Integer feedId);
}
