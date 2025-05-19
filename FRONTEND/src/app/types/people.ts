export interface FaceRequestType {
  type: number;
  page: number;
  size: number;
}

export interface FaceResponseType {
  status: number;
  message: string;
  data: {
    faceList: FaceType[];
  };
}

export interface FaceType {
  faceId: number;
  faceName: string;
  faceThumbnail: string;
  faceDate: string;
}

export interface FaceFeedType {
  feedId: number;
  feedThumbnailImgUrl: string;
  feedFavorite: boolean;
  detectionIds: number[];
}

export interface FaceDetailResponseType {
  status: number;
  message: string;
  data: {
    faceName: string;
    faceFeedList: FaceFeedType[];
  };
}

export interface FaceInvalidateRequest {
  detectionIds: number[];
}

export interface FaceFeedType {
  feedId: number;
  feedThumbnailImgUrl: string;
  feedFavorite: boolean;
  detectionId: number;    // ← 반드시 추가
}
export interface PatchResponseType {
  status: number;
  message: string;
  data: null;
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
  mode: 'default' | 'select';
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
}
