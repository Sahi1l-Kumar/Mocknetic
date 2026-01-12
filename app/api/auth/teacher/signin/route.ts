import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongoose";
import User from "@/database/user.model";
import Account from "@/database/account.model";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: { message: "Email and password required" } },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find account by email
    const account = await Account.findOne({
      providerAccountId: email,
      provider: "credentials",
    });

    if (!account || !account.password) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    // Get user details
    const user = await User.findById(account.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 401 }
      );
    }

    // Check if user is a teacher
    if (user.role !== "teacher") {
      return NextResponse.json(
        { success: false, error: { message: "Teacher access only" } },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, account.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: { message: "Invalid email or password" } },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie with unique name
    const cookieStore = await cookies();
    cookieStore.set("teacher-auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Teacher signin error:", error);
    return NextResponse.json(
      { success: false, error: { message: "Sign in failed" } },
      { status: 500 }
    );
  }
}
