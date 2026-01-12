import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Delete the teacher auth cookie
    cookieStore.delete("teacher-auth-token");

    return NextResponse.json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (error) {
    console.error("Signout error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Sign out failed" } },
      { status: 500 }
    );
  }
}
