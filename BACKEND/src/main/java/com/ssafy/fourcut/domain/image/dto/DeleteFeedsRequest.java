// src/main/java/com/ssafy/fourcut/domain/image/dto/DeleteFeedsRequest.java
package com.ssafy.fourcut.domain.image.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter @NoArgsConstructor
public class DeleteFeedsRequest {
    /** 삭제할 이미지(image_id) 리스트 */
    private List<Integer> imageList;
}
