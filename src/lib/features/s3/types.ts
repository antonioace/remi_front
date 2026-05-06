export interface UploadFileBodyDto {
  folder?: string;
  fileName?: string;
}

export interface UploadFileResponse {
  url: string;
  key?: string;
}

export interface SignedUrlResponse {
  signedUrl: string;
}
