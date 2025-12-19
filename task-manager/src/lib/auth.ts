import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import type { Auth } from "@/types/auth";

export function getUserIdFromRequest(req: NextRequest): number {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }

  const decoded = jwt.verify(token, secret) as Auth.JwtPayload;

  if (!decoded.userId) {
    throw new Error("Invalid token payload");
  }

  return decoded.userId;
}
