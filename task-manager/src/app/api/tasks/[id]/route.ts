import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import type { TaskRow, TaskStatus, Task } from "@/types/tasks";
import type { ResultSetHeader } from "mysql2/promise";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

const updateTaskSchema = z.object({
  title: z.string().min(4).optional(),
  description: z.string().optional(),
  status: z
    .enum(["pending", "in_progress", "completed"] as [TaskStatus, ...TaskStatus[]])
    .optional(),
});

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = Number(context.params.id);

    if (Number.isNaN(id)) {
      return NextResponse.json({ message: "ID da tarefa inválido" }, { status: 400 });
    }

    const body = await req.json();
    const data = updateTaskSchema.parse(body);

    const [existingRows] = await pool.query<TaskRow[]>(
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
      [id, userId],
    );
    
    if (existingRows.length === 0) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    await pool.query<ResultSetHeader>(
      `
      UPDATE tasks
      SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status)
      WHERE id = ? AND user_id = ?
      `,
      [
        data.title ?? null,
        data.description ?? null,
        data.status ?? null,
        id,
        userId,
      ],
    );

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
      [id, userId],
    );
    
    const task: Task | undefined = rows[0];
    
    return NextResponse.json({ task }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Erro de validação", issues: error.issues },
        { status: 400 },
      );
    }

    let message = "Falha ao atualizar tarefa";
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

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } },
) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = Number(context.params.id);

    if (Number.isNaN(id)) {
      return NextResponse.json({ message: "ID da tarefa inválido" }, { status: 400 });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Tarefa deletada com sucesso" },
      { status: 200 },
    );
  } catch (error: unknown) {
    let message = "Falha ao deletar tarefa";
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
