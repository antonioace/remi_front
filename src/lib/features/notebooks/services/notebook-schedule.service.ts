import { HttpClient } from "$lib/features/shared/http-client";
import type { HttpResult } from "$lib/features/shared/types";
import type {
  NotebookSchedule,
  CreateNotebookScheduleDto,
  UpdateNotebookScheduleDto,
  NotebookEvent,
} from "../types";

export class NotebookScheduleService extends HttpClient {
  constructor() {
    super("notebook-schedules");
  }

  async getSchedules(
    notebookId: string,
  ): Promise<HttpResult<NotebookSchedule[]>> {
    return this.get<NotebookSchedule[]>(`/notebook/${notebookId}`);
  }

  async createSchedule(
    notebookId: string,
    data: CreateNotebookScheduleDto,
  ): Promise<HttpResult<NotebookSchedule>> {
    return this.post<NotebookSchedule>(`/notebook/${notebookId}`, data);
  }

  async updateSchedule(
    scheduleId: string,
    data: UpdateNotebookScheduleDto,
  ): Promise<HttpResult<NotebookSchedule>> {
    return this.patch<NotebookSchedule>(`/${scheduleId}`, data);
  }

  async deleteSchedule(scheduleId: string): Promise<HttpResult<void>> {
    return this.delete<void>(`/${scheduleId}`);
  }

  async getScheduleEvents(
    scheduleId: string,
  ): Promise<HttpResult<NotebookEvent[]>> {
    return this.get<NotebookEvent[]>(`/${scheduleId}/events`);
  }
}

export const notebookScheduleService = new NotebookScheduleService();
