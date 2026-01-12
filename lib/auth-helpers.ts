import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: string;
}

async function checkTeacherToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("teacher-auth-token");

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as DecodedToken;

    if (decoded.role !== "teacher") {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function requireAuth(skipTeacherToken = false) {
  if (!skipTeacherToken) {
    const teacherUser = await checkTeacherToken();

    if (teacherUser) {
      return { error: null, user: teacherUser };
    }
  }

  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      ),
      user: null,
    };
  }

  const user = {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name!,
    image: session.user.image,
    role: session.user.role,
  };

  return { error: null, user };
}

export async function requireTeacher() {
  const { error, user } = await requireAuth();

  if (error) return { error, user: null };

  if (user.role !== "teacher") {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: { message: "Forbidden - Teacher access required" },
        },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

export async function requireStudent() {
  const { error, user } = await requireAuth(true);

  if (error) return { error, user: null };

  if (user.role !== "student") {
    return {
      error: NextResponse.json(
        {
          success: false,
          error: { message: "Forbidden - Student access required" },
        },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}
