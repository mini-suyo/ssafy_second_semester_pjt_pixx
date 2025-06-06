// app/lib/api/albumApi.ts

import { AlbumResponse } from "@/app/types/album";
import { AlbumDetailResponse } from "@/app/types/album";
import { AlbumParams, AlbumDeleteResponse } from "@/app/types/album";

// import axiosInstance from "./axiosInstance";
import api from "./axios";

// 앨범 목록 불러오기
export async function getAlbums(params: AlbumParams): Promise<AlbumResponse> {
  const response = await api.post("/api/v1/feed/album", params);
  return response.data;
}

// 앨범 피드 목록 불러오기
export async function getAlbumDetail(albumId: number, params: AlbumParams): Promise<AlbumDetailResponse> {
  const response = await api.post(`/api/v1/feed/album/${albumId}`, params);
  return response.data;
}

// 앨범 삭제
export async function deleteAlbum(albumId: number): Promise<AlbumDeleteResponse> {
  const response = await api.post(`api/v1/album/delete`, { albumId });
  return response.data;
}

// 피드에서 앨범 생성
export async function createAlbum(data: { albumTitle: string; imageList: number[] }) {
  return await api.post("/api/v1/album", data);
}

// 피드에서 앨범에 사진 추가
export async function addPhotosToAlbum(data: { albumId: number; imageList: number[] }) {
  const res = await api.post("/api/v1/album/photo", data);
  return res.data;
}

// 앨범 피드 삭제
export async function deleteAlbumPhotos(payload: {
  albumId: number;
  imageList: number[];
}): Promise<{ message: string }> {
  const response = await api.post("/api/v1/album/photo/delete", payload);
  return response.data;
}
