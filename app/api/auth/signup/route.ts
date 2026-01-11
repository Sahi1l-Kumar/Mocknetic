import { NextRequest, NextResponse } from "next/server";
import { signUpWithCredentials } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await signUpWithCredentials(body);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Signup failed" },
      },
      { status: 500 }
    );
  }
}
