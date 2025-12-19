import type { RowDataPacket } from "mysql2/promise";

export type TaskStatus = "pending" | "in_progress" | "completed";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};

export type TaskRow = Task & RowDataPacket;
