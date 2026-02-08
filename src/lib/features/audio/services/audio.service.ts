import { HttpClient } from "../../shared/http-client";
import type { HttpResult } from "../../shared/types";
import type { Audio } from "../types";
import { isAxiosError } from "axios";

class AudioService extends HttpClient {
  constructor() {
    super("audio");
  }

  async upload(file: File, notebookId: string): Promise<HttpResult<Audio>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("notebookId", notebookId);

    try {
      // Accessing the protected instance directly to override headers
      const response = await this.instance.post<Audio>("upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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

  async getByNotebook(notebookId: string): Promise<HttpResult<Audio[]>> {
    return this.get<Audio[]>(`notebook/${notebookId}`);
  }

  async remove(id: string): Promise<HttpResult<void>> {
    return this.delete<void>(`${id}`);
  }
}

export const audioService = new AudioService();
