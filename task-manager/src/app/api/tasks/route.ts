// src/app/api/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import pool from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);

    const [rows] = await pool.query(
      "SELECT id, title, description, status, created_at, updated_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );

    return NextResponse.json({ tasks: rows }, { status: 200 });
  } catch (error: any) {
    const message = error.message || "Falha ao buscar tarefas";
    const status = message.includes("Authorization") ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const body = await req.json();
    const data = createTaskSchema.parse(body);

    const [result] = await pool.query<any>(
      "INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)",
      [userId, data.title, data.description ?? null, data.status ?? "pending"],
    );

    const insertedId = result.insertId;

    const [rows] = await pool.query(
      "SELECT id, title, description, status, created_at, updated_at FROM tasks WHERE id = ? AND user_id = ?",
      [insertedId, userId],
    );

    const task = Array.isArray(rows) ? rows[0] : rows;

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Erro de validação", issues: error.issues },
        { status: 400 },
      );
    }

    const message = error.message || "Falha ao criar tarefa";
    const status = message.includes("Authorization") ? 401 : 500;
    return NextResponse.json({ message }, { status });
  }
}
