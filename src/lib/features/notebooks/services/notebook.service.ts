import { HttpClient } from "$lib/features/shared/http-client";
import type {
  HttpResult,
  PaginationDto,
  PaginationResult,
} from "$lib/features/shared/types";
import type { Notebook, CreateNotebookDto, UpdateNotebookDto } from "../types";

import { isAxiosError } from "axios";

export class NotebookService extends HttpClient {
  constructor() {
    super("notebooks");
  }

  async createFromAudio(
    file: File,
    timezone: string,
  ): Promise<HttpResult<Notebook>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timezone", timezone);

    try {
      const response = await this.instance.post<Notebook>(
        "create-audio",
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

  async getAll(
    pagination?: PaginationDto,
  ): Promise<HttpResult<PaginationResult<Notebook>>> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append("page", pagination.page.toString());
    if (pagination?.limit) params.append("limit", pagination.limit.toString());

    const queryString = params.toString();
    return this.get<PaginationResult<Notebook>>(
      queryString ? `?${queryString}` : "",
    );
  }

  async getById(id: string): Promise<HttpResult<Notebook>> {
    return this.get<Notebook>(`/${id}`);
  }

  async createNotebook(data: CreateNotebookDto): Promise<HttpResult<Notebook>> {
    return this.post<Notebook>("", data);
  }

  async updateNotebook(
    id: string,
    data: UpdateNotebookDto,
  ): Promise<HttpResult<Notebook>> {
    return this.patch<Notebook>(`/${id}`, data);
  }

  async deleteNotebook(id: string): Promise<HttpResult<void>> {
    return this.delete<void>(`/${id}`);
  }
}

export const notebookService = new NotebookService();
