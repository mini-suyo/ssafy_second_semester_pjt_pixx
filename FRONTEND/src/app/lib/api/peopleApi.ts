// src/app/lib/api/peopleApi.ts

import api from './axios';
import type { 
    FaceResponseType, 
    FaceRequestType,
    FaceDetailResponseType,} from '@/app/types/people';

export async function getFaces(params: FaceRequestType): Promise<FaceResponseType> {
  const { data } = await api.post('/api/v1/feed/face', params);
  return data;
}

export interface FaceDetailRequestType extends FaceRequestType {}

export async function getFaceFeeds(
  faceId: number,
  params: FaceDetailRequestType
): Promise<FaceDetailResponseType> {
  const { data } = await api.post(`/api/v1/feed/face/${faceId}`, params);
  return data;
}

export interface PatchFaceClusterNameResponse {
  status: number;
  message: string;
  data: null;
}

// 얼굴 클러스터 이름 변경
export async function patchFaceClusterName(
  faceId: number,
  faceClusterName: string
): Promise<PatchFaceClusterNameResponse> {
  const { data } = await api.patch(
    `/api/v1/detect/cluster/${faceId}`,
    { faceClusterName }
  );
  return data;
}

// 얼굴 클러스터 삭제
export interface DeleteFaceClusterResponse {
  status: number;
  message: string;
  data: any[]; 
}
export async function deleteFaceCluster(
  faceId: number
): Promise<DeleteFaceClusterResponse> {
  const { data } = await api.post(`/api/v1/detect/${faceId}/delete`);
  return data;
}

