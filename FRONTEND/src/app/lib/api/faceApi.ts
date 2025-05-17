// src/app/lib/api/faceApi.ts

import api from './axios';
import type { FaceResponseType, FaceRequestType } from '@/app/types/face';

export async function getFaces(params: FaceRequestType): Promise<FaceResponseType> {
  const { data } = await api.post('/api/v1/feed/face', params);
  return data;
}
