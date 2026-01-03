import { z } from "zod";

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please provide a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long. " })
    .max(100, { message: "Password cannot exceed 100 characters." }),
});

export const SignUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),

  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),

  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Please provide a valid email address." }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    }),

  role: z.enum(["student", "teacher"]).optional().default("student"),
});

export const UserSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." }),
  email: z.string().email({ message: "Please provide a valid email address." }),
  bio: z.string().optional(),
  image: z.string().url({ message: "Please provide a valid URL." }).optional(),
  location: z.string().optional(),
  role: z.enum(["student", "teacher"]).default("student"), // NEW FIELD
});

export const AccountSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }),
  name: z.string().min(1, { message: "Name is required." }),
  image: z.string().url({ message: "Please provide a valid URL." }).optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." })
    .max(100, { message: "Password cannot exceed 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number." })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character.",
    })
    .optional(),
  provider: z.string().min(1, { message: "Provider is required." }),
  providerAccountId: z
    .string()
    .min(1, { message: "Provider Account ID is required." }),
});

export const SignInWithOAuthSchema = z.object({
  provider: z.enum(["google"]),
  providerAccountId: z
    .string()
    .min(1, { message: "Provider Account ID is required." }),
  user: z.object({
    name: z.string().min(1, { message: "Name is required." }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters long." }),
    email: z
      .string()
      .email({ message: "Please provide a valid email address." }),
    image: z.string().url("Invalid image URL").optional(),
    role: z.enum(["student", "teacher"]).optional().default("student"),
  }),
});

export const CreateChatSchema = z.object({
  title: z.string().default("New Chat"),
  message: z.object({
    sender: z.enum(["user", "ai"]),
    content: z.string().min(1, { message: "Message content is required." }),
    imageUrl: z
      .string()
      .url({ message: "Please provide a valid URL." })
      .optional(),
    detectedDisease: z.string().optional(),
  }),
});

export const GetChatSchema = z.object({
  chatId: z.string().min(1, { message: "Chat ID is required." }),
});

export const CreateClassroomSchema = z.object({
  name: z.string().min(1, { message: "Classroom name is required." }).max(100),
  description: z.string().optional(),
  subject: z.string().optional(),
});

export const JoinClassroomSchema = z.object({
  code: z
    .string()
    .length(6, { message: "Class code must be exactly 6 characters." })
    .regex(/^[A-Z0-9]+$/, {
      message: "Class code can only contain uppercase letters and numbers.",
    }),
});

export const CreateClassroomAssessmentSchema = z.object({
  classroomId: z.string().min(1, { message: "Classroom ID is required." }),
  title: z.string().min(1, { message: "Assessment title is required." }),
  description: z.string().optional(),
  curriculum: z
    .string()
    .min(50, { message: "Curriculum must be at least 50 characters." }),
  curriculumFile: z.string().url().optional(),
  dueDate: z.string().datetime().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  totalQuestions: z.number().min(1).max(50).default(10),
});
