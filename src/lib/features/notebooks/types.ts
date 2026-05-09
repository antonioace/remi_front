export interface NoteTask {
  id: string;
  name?: string;
  contentText: string;
}

export interface NoteImage {
  id: string;
  url: string;
  key?: string;
  text: string;
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  textContent: string;
  content?: {
    tasks?: NoteTask[];
    tags?: string[];
    images?: NoteImage[];
    audios?: unknown[];
    alarms?: unknown[];
    [key: string]: unknown;
  };
  userId: string;
  assignedAt?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotebookDto {
  name: string;
  description?: string;
  textContent: string;
  content?: Record<string, unknown>;
  userId: string;
  assignedAt?: string;
  timezone?: string;
}

export interface UpdateNotebookDto extends Partial<
  Omit<CreateNotebookDto, "userId">
> {
  id?: string;
}

export interface NotebookSchedule {
  id: string;
  notebookId: string;
  name: string;
  description?: string;
  type: "normal" | "recurrent";
  status: "pending" | "executed";
  isEnabled: boolean;
  date: string;
  startDate: string;
  endDate: string;
  interval: {
    days: number;
    hours: number;
    minutes: number;
  };
  channels: string[];
  createdAt: string;
  lastExecutionAt?: Date;
}

export type CreateNotebookScheduleDto = Omit<
  NotebookSchedule,
  "id" | "createdAt" | "notebookId" | "status" | "isEnabled"
>;
export type UpdateNotebookScheduleDto = Partial<
  Omit<NotebookSchedule, "id" | "createdAt" | "notebookId">
>;

export enum NotebookEventStatus {
  PENDING = "pending",
  EXECUTED = "executed",
  FAILED = "failed",
  CANCELED = "canceled",
}

export enum NotebookEventType {
  CREATED = "created",
  UPDATED = "updated",
  SCHEDULED = "scheduled",
}

export interface NotebookEvent {
  id: string;
  notebookId: string;
  scheduleId?: string;
  assignedAt?: string;
  type: NotebookEventType;
  status: NotebookEventStatus;
  userId: string;
  channels: string[];
  isRecurrent: boolean;
  interval?: { days: number; hours: number; minutes: number };
  payload?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
