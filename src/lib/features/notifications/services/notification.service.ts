import { HttpClient } from "$lib/features/shared/http-client";
import type {
  HttpResult,
  PaginationDto,
  PaginationResult,
} from "$lib/features/shared/types";
import type {
  Notification,
  CreateNotificationDto,
  UpdateNotificationDto,
} from "../types";

export class NotificationService extends HttpClient {
  constructor() {
    super("notifications");
  }

  async getAll(
    pagination?: PaginationDto,
  ): Promise<HttpResult<PaginationResult<Notification>>> {
    const params = new URLSearchParams();
    if (pagination?.page) params.append("page", pagination.page.toString());
    if (pagination?.limit) params.append("limit", pagination.limit.toString());

    const queryString = params.toString();
    return this.get<PaginationResult<Notification>>(
      queryString ? `?${queryString}` : "",
    );
  }

  async getById(id: string): Promise<HttpResult<Notification>> {
    return this.get<Notification>(`/${id}`);
  }

  async create(data: CreateNotificationDto): Promise<HttpResult<Notification>> {
    return this.post<Notification>("", data);
  }

  async update(
    id: string,
    data: UpdateNotificationDto,
  ): Promise<HttpResult<Notification>> {
    return this.patch<Notification>(`/${id}`, data);
  }

  async markAsRead(id: string): Promise<HttpResult<Notification>> {
    return this.patch<Notification>(`/${id}/read`, {});
  }

  async remove(id: string): Promise<HttpResult<void>> {
    return this.delete<void>(`/${id}`);
  }
}

export const notificationService = new NotificationService();
