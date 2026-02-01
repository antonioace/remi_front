export interface NoteTask {
  id: string;
  name: string;
  contentText: string;
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  textContent: string;
  content?: {
    tasks?: NoteTask[];
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
