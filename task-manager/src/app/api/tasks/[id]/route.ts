import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

type RouteParams = {
  params: { id: string };
};

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = Number(params.id);

    if (Number.isNaN(id)) {
      return NextResponse.json({ message: "ID da tarefa inválido" }, { status: 400 });
    }

    const body = await req.json();
    const data = updateTaskSchema.parse(body);

    const [existingRows] = await pool.query(
      "SELECT id FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId],
    );
    const exists =
      Array.isArray(existingRows) && existingRows.length > 0
        ? existingRows[0]
        : null;

    if (!exists) {
      return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
    }

    await pool.query(
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

    const [rows] = await pool.query(
      "SELECT id, title, description, status, created_at, updated_at FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    const task = Array.isArray(rows) ? rows[0] : rows;

    return NextResponse.json({ task }, { status: 200 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Erro de validação", issues: error.issues },
        { status: 400 },
      );
    }

    const message = error.message || "Falha ao atualizar tarefa";
    const status = message.includes("Authorization") ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = getUserIdFromRequest(req);
    const id = Number(params.id);

    if (Number.isNaN(id)) {
      return NextResponse.json({ message: "ID da tarefa inválido" }, { status: 400 });
    }

    const [result] = await pool.query<any>(
      "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "Tarefa não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ message: "Tarefa deletada com sucesso" });
  } catch (error: any) {
    const message = error.message || "Falha ao deletar tarefa";
    const status = message.includes("Authorization") ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
