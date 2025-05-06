// album 타입 정의
// app/types/album.ts

export interface Album {
  albumId: number;
  albumName: string;
  albumDate: string; // ISO 문자열
}

export interface AlbumResponse {
  status: string;
  message: string;
  data: {
    albumList: Album[];
  };
}
