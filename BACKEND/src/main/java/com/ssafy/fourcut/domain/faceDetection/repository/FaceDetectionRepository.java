package com.ssafy.fourcut.domain.faceDetection.repository;

import com.ssafy.fourcut.domain.faceDetection.entity.FaceDetection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FaceDetectionRepository extends JpaRepository<FaceDetection, Integer> {
    // userId에 속함
    // - faceVector is null
    // - isValid == true
    // 에 해당하는 FaceDectection 리스트를 가져옴.
    List<FaceDetection> findByFaceVectorIsNullAndValidTrueAndImage_ImageId(Integer imageId);
    Optional<FaceDetection> findByDetectionIdAndValidTrue(Integer detectionId);

    // face_id 에 매핑된 유효한 검출만 꺼내오기
    List<FaceDetection> findByFaceVector_FaceIdAndValidTrue(Integer faceId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM FaceDetection fd WHERE fd.image.feed.feedId IN :feedIds")
    int deleteByFeedIds(@Param("feedIds") List<Integer> feedIds);
}
