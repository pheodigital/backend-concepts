export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: "OPEN" | "IN_PROGRESS" | "DONE";
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
