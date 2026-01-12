import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("teacher-auth-token");

    if (!token) {
      return NextResponse.json({ user: null });
    }

    try {
      const decoded = jwt.verify(token.value, JWT_SECRET) as {
        id: string;
        email: string;
        name: string;
        image?: string;
        role: string;
      };

      // Verify it's a teacher
      if (decoded.role !== "teacher") {
        return NextResponse.json({ user: null });
      }

      return NextResponse.json({
        user: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          image: decoded.image,
          role: decoded.role,
        },
      });
    } catch {
      return NextResponse.json({ user: null });
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ user: null });
  }
}
