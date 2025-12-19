import { z } from "zod";

export const taskStatusEnum = z.enum(["pending", "in_progress", "done"]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: taskStatusEnum.optional(), // default 'pending' se vier vazio
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    status: taskStatusEnum.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );