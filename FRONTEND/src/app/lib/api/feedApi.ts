// app/lib/api/feedApi.ts

import axiosInstance from "./axiosInstance";
import { Feed, DeleteFeedResponse } from "@/app/types/feed";

//피드 목록 조회 API
export const getFeeds = async (params: { type: number; page: number; size: number }): Promise<Feed[]> => {
  const response = await axiosInstance.post("/api/v1/feed", params);
  return response.data.data; // data 안에 data
};

// 피드 상세 조회 API
export async function getFeedDetail(feedId: string) {
  const response = await axiosInstance.get(`/api/v1/feed/${feedId}`);
  return response.data.data;
}

// 피드 삭제 API
export async function deleteFeed(payload: { imageList: number[] }): Promise<DeleteFeedResponse> {
  const response = await axiosInstance.post("/api/v1/feed/delete", payload);
  return response.data;
}
