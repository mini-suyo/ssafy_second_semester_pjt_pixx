package com.ssafy.fourcut.domain.faceDetection.service;

import com.ssafy.fourcut.domain.faceDetection.entity.FaceVector;
import com.ssafy.fourcut.domain.faceDetection.repository.FaceVectorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FaceVectorService {
    private final FaceVectorRepository faceVectorRepo;

    @Transactional
    public void updateThumbnailUrl(Integer faceId, String thumbnailUrl) {
        FaceVector fv = faceVectorRepo.findById(faceId)
                .orElseThrow(() -> new RuntimeException("FaceVector not found: "+faceId));
        fv.setFaceThumbnail(thumbnailUrl);
        faceVectorRepo.save(fv);
    }
}