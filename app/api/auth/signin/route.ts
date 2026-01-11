import { NextRequest, NextResponse } from "next/server";
import { signInWithCredentials } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await signInWithCredentials(body);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: { message: "Signin failed" },
      },
      { status: 500 }
    );
  }
}
