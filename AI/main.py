# FastAPI: main.py
from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel
from typing import List
from facenet_pytorch import MTCNN, InceptionResnetV1
from sklearn.metrics.pairwise import cosine_similarity
from PIL import Image
import numpy as np
import requests
from io import BytesIO
import uvicorn

app = FastAPI()

# 얼굴 검출·임베딩 모델 초기화
mtcnn = MTCNN(keep_all=True)
resnet = InceptionResnetV1(pretrained='vggface2').eval()
THRESHOLD = 0.81  # 클러스터링 임계값

class DetectRequest(BaseModel):
    imgUrl: str

class FaceData(BaseModel):
    boundingBox: List[float]
    vectorData: List[float]

class DetectResponse(BaseModel):
    status: int
    message: str
    data: List[FaceData] = []

@app.post("/api/v1/detect/{imageId}", response_model=DetectResponse)
async def detect(
    req: DetectRequest,
    imageId: int):
    # 1) 이미지 로드
    try:
        resp = requests.get(req.imgUrl, timeout=5)
        resp.raise_for_status()
        img = Image.open(BytesIO(resp.content))
    except Exception:
        raise HTTPException(status_code=400, detail="이미지 불러오기 실패")

    # 2) 얼굴 검출
    boxes, _ = mtcnn.detect(img)
    if boxes is None or len(boxes) == 0:
        return DetectResponse(status=200, message="얼굴 검출 성공", data=[])

    # 3) 임베딩 생성
    face_tensors = mtcnn(img)                      # (N,3,160,160)
    embeddings   = resnet(face_tensors)            # (N,512)
    embeddings   = embeddings.detach().cpu().numpy()

    # 4) 단순 클러스터링 (시퀀셜 평균 방식)
    clusters = []
    for box, emb in zip(boxes, embeddings):
        placed = False
        for c in clusters:
            sim = cosine_similarity([emb], [c['emb']])[0][0]
            if sim >= THRESHOLD:
                # 클러스터 업데이트
                c['emb'] = (c['emb'] * c['count'] + emb) / (c['count'] + 1)
                c['count'] += 1
                placed = True
                break
        if not placed:
            clusters.append({'emb': emb, 'box': box, 'count': 1})

    # 5) 결과 포맷
    data = [
        FaceData(
            boundingBox=c['box'].tolist(),
            vectorData=c['emb'].tolist()
        ) for c in clusters
    ]

    return DetectResponse(status=200, message="얼굴 검출 성공", data=data)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)