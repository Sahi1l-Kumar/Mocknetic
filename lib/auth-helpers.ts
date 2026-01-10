import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { error: null, user: session.user };
}

export async function requireTeacher() {
  const { error, user } = await requireAuth();

  if (error) return { error, user: null };

  if (user.role !== "teacher") {
    return {
      error: NextResponse.json(
        { success: false, error: "Forbidden - Teacher access required" },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

export async function requireStudent() {
  const { error, user } = await requireAuth();

  if (error) return { error, user: null };

  if (user.role !== "student") {
    return {
      error: NextResponse.json(
        { success: false, error: "Forbidden - Student access required" },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}
