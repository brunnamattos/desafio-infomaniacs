import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "@/lib/jwt";

type AuthTokenPayload = JwtPayload & {
  sub: number;
  email: string;
};

function isAuthTokenPayload(value: unknown): value is AuthTokenPayload {
  if (!value || typeof value !== "object") return false;

  const v = value as Record<string, unknown>;

  return typeof v.sub === "number" && typeof v.email === "string";
}

export function getAuthUserId(req: Request): number {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.slice(7);

  const decoded: unknown = verifyToken(token);

  if (!isAuthTokenPayload(decoded)) {
    throw new Error("Unauthorized");
  }

  return decoded.sub;
}
