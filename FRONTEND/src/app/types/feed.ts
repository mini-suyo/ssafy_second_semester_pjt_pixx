// app/types/feed.ts
// Feed 타입 정의

export interface Feed {
  feedId: number;
  feedThumbnailImgUrl: string;
  feedFavorite: boolean;
}

export type BrandListResponse = {
  brandList: {
    brandName: string;
    feeds: Feed[];
  }[];
};

export type BrandListMoreResponse = {
  brandName: string;
  brandFeedList: Feed[];
};

export interface FeedFile {
  imageId: number;
  imageUrl: string;
  imageType: "IMAGE" | "VIDEO" | "GIF";
}

export interface FeedDetailResponse {
  feedList: FeedFile[];
  feedTitle: string;
  feedHashtags: string[];
  feedMemo: string;
  brandName: string;
  feedLocation: string;
  feedDate: string;
  feedFavorite: boolean;
}

export interface DeleteFeedResponse {
  status: string;
  message: string;
  data: Record<string, never>;
}

export interface FeedDetailUpdate {
  feedId: number;
  feedTitle: string;
  feedDate: string;
  location: string;
  brandName: string;
  feedMemo: string;
  hashtags: string[];
}

export interface FavoriteResponse {
  feedId: number;
  isFavorite: boolean;
}
