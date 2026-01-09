import mongoose from "mongoose";
import { NextResponse } from "next/server";
import slugify from "slugify";

import Account from "@/database/account.model";
import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const validatedData = SignInWithOAuthSchema.safeParse({
      provider,
      providerAccountId,
      user,
    });

    if (!validatedData.success)
      throw new ValidationError(validatedData.error.flatten().fieldErrors);

    const { name, username, email, image, role = "student" } = user;

    let existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      existingUser.name = name;
      existingUser.image = image;
      await existingUser.save({ session });
    } else {
      const baseUsername = slugify(username || email.split("@")[0], {
        lower: true,
        strict: true,
        trim: true,
      });

      let finalUsername = baseUsername;
      const usernameExists = await User.findOne({
        username: baseUsername,
      }).session(session);

      if (usernameExists) {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        finalUsername = `${baseUsername}-${randomSuffix}`;
      }

      const [newUser] = await User.create(
        [
          {
            name,
            username: finalUsername,
            email,
            image,
            role,
          },
        ],
        { session }
      );

      existingUser = newUser;
    }

    const existingAccount = await Account.findOne({
      userId: existingUser._id,
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name,
            image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      user: {
        id: existingUser._id.toString(),
        email: existingUser.email,
        username: existingUser.username,
      },
    });
  } catch (error: unknown) {
    await session.abortTransaction();
    console.error("OAuth sign in error:", error);

    const errorResponse = handleError(error, "api");
    return errorResponse as NextResponse;
  } finally {
    session.endSession();
  }
}
