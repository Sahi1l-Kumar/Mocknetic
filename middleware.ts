import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // CORS for teacher portal
  const origin = request.headers.get("origin");
  const allowedOrigins = [
    "http://localhost:5173",
    "https://teachers.mocknetic.com",
  ];

  const corsHeaders = {
    "Access-Control-Allow-Origin":
      origin && allowedOrigins.includes(origin) ? origin : "",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  };

  if (request.method === "OPTIONS") {
    return NextResponse.json({}, { status: 200, headers: corsHeaders });
  }

  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    if (value) response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
