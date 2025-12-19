import { z } from "zod";

export const taskStatusSchema = z.enum(["pending", "in_progress", "completed"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: taskStatusSchema.optional(), // TODO: default no backend: pending
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: taskStatusSchema.optional(),
});
