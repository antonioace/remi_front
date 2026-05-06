import { HttpClient } from "../../shared/http-client";
import type { HttpResult } from "../../shared/types";
import { isAxiosError } from "axios";
import type {
  UploadFileBodyDto,
  SignedUrlResponse,
  UploadFileResponse,
} from "../types";

class S3Service extends HttpClient {
  constructor() {
    super("s3");
  }

  async uploadFile(
    file: File,
    options?: UploadFileBodyDto,
  ): Promise<HttpResult<UploadFileResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.folder) {
      formData.append("folder", options.folder);
    }
    if (options?.fileName) {
      formData.append("fileName", options.fileName);
    }

    try {
      //
      const response = await this.instance.post<UploadFileResponse>(
        "upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getSignedUrl(path: string): Promise<HttpResult<SignedUrlResponse>> {
    return this.post<SignedUrlResponse>("signed-url", { url: path });
  }
}

export const s3Service = new S3Service();
