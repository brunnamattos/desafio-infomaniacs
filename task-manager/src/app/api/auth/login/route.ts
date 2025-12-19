import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

import pool from "@/lib/db";
import { loginSchema } from "@/schemas/auth.schema";
import { signToken } from "@/lib/jwt";

type UserRow = RowDataPacket & {
  id: number;
  name: string;
  email: string;
  password: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [data.email]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "E-mail ou senha inválidos" }, { status: 401 });
    }

    const userRow = rows[0];

    const passwordValid = await bcrypt.compare(data.password, userRow.password);
    if (!passwordValid) {
      return NextResponse.json({ message: "E-mail ou senha inválidos" }, { status: 401 });
    }

    const token = signToken({ sub: userRow.id, email: userRow.email });

    const user = { id: userRow.id, name: userRow.name, email: userRow.email };

    return NextResponse.json({ token, user }, { status: 200 });
  } catch (error: unknown) {
    console.error("LOGIN_ERROR:", error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
