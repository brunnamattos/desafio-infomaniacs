import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import type { TaskRow, TaskStatus, Task } from "@/types/tasks";
import type { ResultSetHeader } from "mysql2/promise";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

const createTaskSchema = z.object({
  title: z.string().min(4, "Título é obrigatório"),
  description: z.string().optional(),
  status: z
    .enum(["pending", "in_progress", "completed"] as [TaskStatus, ...TaskStatus[]])
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);

    const [rows] = await pool.query<TaskRow[]>(
      `
      SELECT
        id,
        title,
        description,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM tasks
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId],
    );
    
    const tasks: Task[] = rows;
    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error: unknown) {
    let message = "Failed to fetch tasks";
    let status = 500;

    if (error instanceof Error) {
      message = error.message;
      if (message.includes("Authorization")) {
        status = 401;
      }
    }

    return NextResponse.json({ message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const body = await req.json();
    const data = createTaskSchema.parse(body);

    const [result] = await pool.query<ResultSetHeader>(
      `
      INSERT INTO tasks (user_id, title, description, status)
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        data.title,
        data.description ?? null,
        data.status ?? "pending",
      ],
    );

    const insertedId = result.insertId;

    const [rows] = await pool.query<TaskRow[]>(
      `
      SELECT
        id,
        title,
        description,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM tasks
      WHERE id = ? AND user_id = ?
      `,
      [insertedId, userId],
    );
    
    const task: Task | undefined = rows[0];
    
    return NextResponse.json({ task }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation error", issues: error.issues },
        { status: 400 },
      );
    }

    let message = "Failed to create task";
    let status = 500;

    if (error instanceof Error) {
      message = error.message;
      if (message.includes("Authorization")) {
        status = 401;
      }
    }

    return NextResponse.json({ message }, { status });
  }
}
