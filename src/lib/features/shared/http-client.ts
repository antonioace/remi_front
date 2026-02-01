import axios, {
  type AxiosInstance,
  type AxiosResponse,
  isAxiosError,
} from "axios";
import { PUBLIC_API_BASE_URL } from "$env/static/public";
import type { HttpResult } from "./types";

export abstract class HttpClient {
  protected instance: AxiosInstance;

  constructor(endpoint: string) {
    this.instance = axios.create({
      baseURL: `${PUBLIC_API_BASE_URL}/${endpoint}`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request Interceptor: Add Token
    this.instance.interceptors.request.use((config) => {
      if (typeof localStorage !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response Interceptor: Handle 401
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      },
    );
  }

  private async request<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    data?: unknown,
  ): Promise<HttpResult<T>> {
    try {
      const response: AxiosResponse<T> = await this.instance.request({
        method,
        url,
        data,
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

  protected async get<T>(url: string = ""): Promise<HttpResult<T>> {
    return this.request<T>("get", url);
  }

  protected async post<T>(
    url: string = "",
    data?: unknown,
  ): Promise<HttpResult<T>> {
    return this.request<T>("post", url, data);
  }

  protected async put<T>(
    url: string = "",
    data?: unknown,
  ): Promise<HttpResult<T>> {
    return this.request<T>("put", url, data);
  }

  protected async patch<T>(
    url: string = "",
    data?: unknown,
  ): Promise<HttpResult<T>> {
    return this.request<T>("patch", url, data);
  }

  protected async delete<T>(url: string = ""): Promise<HttpResult<T>> {
    return this.request<T>("delete", url);
  }
}
