// app/lib/api/feedApi.ts

import axiosInstance from "./axiosInstance";
import { Feed } from "@/app/types/feed";

export const getFeeds = async (params: { type: number; page: number; size: number }): Promise<Feed[]> => {
  const response = await axiosInstance.post("/api/v1/feed", params);
  return response.data.data; // data 안에 data
};
