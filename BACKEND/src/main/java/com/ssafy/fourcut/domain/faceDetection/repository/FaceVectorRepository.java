package com.ssafy.fourcut.domain.faceDetection.repository;

import com.ssafy.fourcut.domain.faceDetection.entity.FaceVector;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaceVectorRepository extends JpaRepository<FaceVector, Integer> {
    // 특정 userId가 소유한 모든 FaceVector를 반환
    List<FaceVector> findByUser_UserId(Integer userId);
    Page<FaceVector> findByUser_UserId(Integer userId, Pageable pageable);
}
