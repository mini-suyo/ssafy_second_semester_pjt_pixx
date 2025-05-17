export interface FaceRequestType {
    type: number;
    page: number;
    size: number;
  }
  
  export interface FaceResponseType {
    status: number;  
    message: string;
    data: { faceList: FaceType[] };
  }
  
  export interface FaceType {
    faceId: number;
    faceName: string;
    faceThumbnail: string;
    faceDate: string;
  }