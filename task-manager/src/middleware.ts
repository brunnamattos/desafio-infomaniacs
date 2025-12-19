import { NextResponse } from "next/server";

export function middleware() {
  console.log("Middleware executou");
  return NextResponse.next();
}