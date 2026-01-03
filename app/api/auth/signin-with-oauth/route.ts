import mongoose from "mongoose";
import { NextResponse } from "next/server";
import slugify from "slugify";

import Account from "@/database/account.model";
import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { ValidationError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { SignInWithOAuthSchema } from "@/lib/validations";
import { ErrorResponse } from "@/types/global";

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

    const slugifiedUsername = slugify(username, {
      lower: true,
      strict: true,
      trim: true,
    });

    const update = {
      $set: {
        name: name,
        image: image,
      },
    };

    const onInsert = {
      $setOnInsert: {
        username: slugifiedUsername,
        email: email,
        role: role,
      },
    };

    const updateOrInsert = { ...update, ...onInsert };

    const existingUser = await User.findOneAndUpdate(
      { email },
      updateOrInsert,
      {
        new: true,
        upsert: true,
        session,
        runValidators: true,
      }
    );

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

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    await session.abortTransaction();
    console.error("OAuth sign in error:", error);
    return handleError(error, "api") as ErrorResponse;
  } finally {
    session.endSession();
  }
}
