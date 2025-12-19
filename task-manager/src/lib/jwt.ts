import jwt, { SignOptions } from "jsonwebtoken";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
}

export function getJwtExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_EXPIRES_IN ?? "2h") as SignOptions["expiresIn"];
}

export function signToken(payload: object): string {
  const options: SignOptions = {
    expiresIn: getJwtExpiresIn(),
  };

  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyToken(token: string): unknown {
  return jwt.verify(token, getJwtSecret());
}