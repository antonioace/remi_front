export interface Notification {
  id: string;
  title: string;
  message: string;
  readAt: string | null;
  userId: string;
  createdAt: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
}

export interface UpdateNotificationDto {
  title?: string;
  message?: string;
  readAt?: string | null;
}
