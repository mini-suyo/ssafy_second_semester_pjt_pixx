// app/lib/api/feedApi.ts

import { Feed, DeleteFeedResponse, FeedDetailUpdate } from "@/app/types/feed";

// import axiosInstance from "./axiosInstance";
import api from "./axios";

//피드 목록 조회 API
export const getFeeds = async (params: { type: number; page: number; size: number }): Promise<Feed[]> => {
  const response = await api.post("/api/v1/feed", params);
  return response.data.data; // data 안에 data
};

// 피드 상세 조회 API
export async function getFeedDetail(feedId: number) {
  const response = await api.get(`/api/v1/feed/${feedId}`);
  return response.data.data;
}

// 피드 삭제 API
export async function deleteFeed(payload: { imageList: number[] }): Promise<DeleteFeedResponse> {
  const response = await api.post("/api/v1/feed/delete", payload);
  return response.data;
}

// 피드 정보 수정 API
export async function updateFeed(feedId: number, data: FeedDetailUpdate) {
  const response = await api.put(`/api/v1/feed/${feedId}`, data);
  return response.data;
}

// 사진 다운로드 API
export const downloadImageFile = async (imageId: number) => {
  const response = await api.get(`/api/v1/photos/download/${imageId}`);
  const fileUrl = response.data.signedUrl;
  if (!fileUrl) throw new Error("signedUrl이 응답에 없습니다.");
  return fileUrl;
};

// 피드 좋아요
export const favoriteFeed = async (feedId: number) => {
  const response = await api.get(`/api/v1/feed/${feedId}/favorite`);
  return response.data;
};
