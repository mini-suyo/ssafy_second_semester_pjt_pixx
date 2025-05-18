// src/app/lib/api/faceApi.ts

import api from './axios';
import type { 
    FaceResponseType, 
    FaceRequestType,
    FaceDetailResponseType} from '@/app/types/people';

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