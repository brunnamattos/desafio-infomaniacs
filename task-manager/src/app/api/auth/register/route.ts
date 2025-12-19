import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { ZodError } from "zod";

import pool from "@/lib/db";
import { registerSchema } from "@/schemas/auth.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [data.email]
    );

    if (existing.length > 0) {
      return NextResponse.json({ message: "E-mail já em uso" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [data.name, data.email, hashedPassword]
    );

    const user = { id: result.insertId, name: data.name, email: data.email };

    return NextResponse.json(
      { message: "Usuário criado com sucesso", user },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("REGISTER_ERROR:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Erro de validação", issues: error.issues },
        { status: 422 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
