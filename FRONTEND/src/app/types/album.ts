// app/types/album.ts

export interface Album {
  albumId: number;
  albumName: string;
  albumDate: string; // ISO 문자열
  albumMemo?: string;
}

export interface AlbumFeed {
  feedId: number;
  feedThumbnailImgUrl: string;
  feed_favorite: boolean;
}

export interface AlbumDetail {
  albumId: number;
  albumName: string;
  albumDate: string;
  albumMemo: string;
  albumFeedList: AlbumFeed[];
}

export interface AlbumResponse {
  status: number;
  message: string;
  data: {
    albumList: Album[];
  };
}

export interface AlbumDetailResponse {
  status: number;
  message: string;
  data: AlbumDetail;
}

export interface AlbumParams {
  type: number;
  page: number;
  size: number;
}

export interface FeedThumbnailItemProps {
  feedId: number;
  imageUrl: string;
  isLoaded: boolean;
  isError: boolean;
  onClick: () => void;
  onLoad: () => void;
  onError: () => void;
  onRetry: (e: React.MouseEvent) => void;
  isSelected: boolean;
  mode: "default" | "select";
}
