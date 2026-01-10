import ROUTES from "@/constants/routes";
import { IAccount } from "@/database/account.model";
import { IUser } from "@/database/user.model";

import { fetchHandler } from "./handlers/fetch";
import {
  CheckStatusRequest,
  ExecuteCodeRequest,
  FileParserResponse,
  GenerateRecommendationsRequest,
  SubmitCodeRequest,
} from "@/types/global";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export const api = {
  auth: {
    oAuthSignIn: ({
      user,
      provider,
      providerAccountId,
    }: SignInWithOAuthParams) =>
      fetchHandler(`${API_BASE_URL}/auth/${ROUTES.SIGN_IN_WITH_OAUTH}`, {
        method: "POST",
        body: JSON.stringify({ user, provider, providerAccountId }),
      }),
  },

  users: {
    getAll: () => fetchHandler(`${API_BASE_URL}/users`),
    getById: (id: string) => fetchHandler(`${API_BASE_URL}/users/${id}`),
    getByEmail: (email: string) =>
      fetchHandler(`${API_BASE_URL}/users/email`, {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    create: (userData: Partial<IUser>) =>
      fetchHandler(`${API_BASE_URL}/users`, {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    update: (id: string, userData: Partial<IUser>) =>
      fetchHandler(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      }),
    delete: (id: string) =>
      fetchHandler(`${API_BASE_URL}/users/${id}`, { method: "DELETE" }),
  },

  accounts: {
    getAll: () => fetchHandler(`${API_BASE_URL}/accounts`),
    getById: (id: string) => fetchHandler(`${API_BASE_URL}/accounts/${id}`),
    getByProvider: (providerAccountId: string) =>
      fetchHandler(`${API_BASE_URL}/accounts/provider`, {
        method: "POST",
        body: JSON.stringify({ providerAccountId }),
      }),
    create: (accountData: Partial<IAccount>) =>
      fetchHandler(`${API_BASE_URL}/accounts`, {
        method: "POST",
        body: JSON.stringify(accountData),
      }),
    update: (id: string, accountData: Partial<IAccount>) =>
      fetchHandler(`${API_BASE_URL}/accounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(accountData),
      }),
    delete: (id: string) =>
      fetchHandler(`${API_BASE_URL}/accounts/${id}`, { method: "DELETE" }),
  },

  skillassessment: {
    generateQuestions: (
      jobRole: string,
      difficulty: string,
      experienceLevel: string
    ) =>
      fetchHandler(`${API_BASE_URL}/skill-assessment/generate-questions`, {
        method: "POST",
        body: JSON.stringify({ jobRole, difficulty, experienceLevel }),
      }),
    submitAnswers: (
      assessmentId: string,
      answers: Record<string, string | number>
    ) =>
      fetchHandler(`${API_BASE_URL}/skill-assessment/submit`, {
        method: "POST",
        body: JSON.stringify({ assessmentId, answers }),
      }),
    generateRecommendations: (data: GenerateRecommendationsRequest) =>
      fetchHandler(
        `${API_BASE_URL}/skill-assessment/generate-recommendations`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      ),
  },

  resume: {
    parse: async (file: File): Promise<FileParserResponse> => {
      const formData = new FormData();
      formData.append("FILE", file);

      try {
        const response = await fetch(`${API_BASE_URL}/fileparser`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          return {
            success: false,
            error: errorData.error || "Failed to parse resume",
          };
        }

        const data = await response.json();
        const resumeId = response.headers.get("ResumeId");
        const fileName = response.headers.get("FileName");

        return {
          success: true,
          data: {
            ...data,
            resumeId: resumeId || "",
            fileName: fileName || "",
          },
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  },

  judge0: {
    execute: (data: ExecuteCodeRequest) =>
      fetchHandler(`${API_BASE_URL}/judge0/execute`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    submit: (data: SubmitCodeRequest) =>
      fetchHandler(`${API_BASE_URL}/judge0/submit`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    checkStatus: (data: CheckStatusRequest) =>
      fetchHandler(`${API_BASE_URL}/judge0/status`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  classroom: {
    // Teacher routes
    getAll: () => fetchHandler(`${API_BASE_URL}/classroom`),
    getById: (id: string) => fetchHandler(`${API_BASE_URL}/classroom/${id}`),
    create: (data: { name: string; description?: string; subject?: string }) =>
      fetchHandler(`${API_BASE_URL}/classroom`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchHandler(`${API_BASE_URL}/classroom/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchHandler(`${API_BASE_URL}/classroom/${id}`, {
        method: "DELETE",
      }),

    // Student management
    getStudents: (id: string) =>
      fetchHandler(`${API_BASE_URL}/classroom/${id}/student`),
    addStudent: (id: string, studentEmail: string) =>
      fetchHandler(`${API_BASE_URL}/classroom/${id}/student`, {
        method: "POST",
        body: JSON.stringify({ studentEmail }),
      }),
    removeStudent: (classroomId: string, studentId: string) =>
      fetchHandler(
        `${API_BASE_URL}/classroom/${classroomId}/student/${studentId}`,
        {
          method: "DELETE",
        }
      ),

    // Assessment management
    getAssessments: (id: string) =>
      fetchHandler(`${API_BASE_URL}/classroom/${id}/assessment`),
    createAssessment: (id: string, data: any) =>
      fetchHandler(`${API_BASE_URL}/classroom/${id}/assessment`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  assessment: {
    getById: (id: string) =>
      fetchHandler(`${API_BASE_URL}/classroom-assessment/${id}`),
    update: (id: string, data: any) =>
      fetchHandler(`${API_BASE_URL}/classroom-assessment/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchHandler(`${API_BASE_URL}/classroom-assessment/${id}`, {
        method: "DELETE",
      }),
    publish: (id: string, isPublished: boolean) =>
      fetchHandler(`${API_BASE_URL}/classroom-assessment/${id}/publish`, {
        method: "POST",
        body: JSON.stringify({ isPublished }),
      }),
    submit: (id: string, answers: any, timeSpent: number) =>
      fetchHandler(`${API_BASE_URL}/classroom-assessment/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers, timeSpent }),
      }),
    getResults: (id: string) =>
      fetchHandler(`${API_BASE_URL}/classroom-assessment/${id}/results`),
  },

  submission: {
    getById: (id: string) =>
      fetchHandler(`${API_BASE_URL}/classroom-submission/${id}`),
    grade: (id: string, grades: any[]) =>
      fetchHandler(`${API_BASE_URL}/classroom-submission/${id}/grade`, {
        method: "POST",
        body: JSON.stringify({ grades }),
      }),
  },

  student: {
    getClassrooms: () => fetchHandler(`${API_BASE_URL}/student/classrooms`),
    joinClassroom: (code: string) =>
      fetchHandler(`${API_BASE_URL}/student/classrooms/join`, {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    getAssessments: (classroomId?: string) => {
      const url = classroomId
        ? `${API_BASE_URL}/student/assessments?classroomId=${classroomId}`
        : `${API_BASE_URL}/student/assessments`;
      return fetchHandler(url);
    },
    getSubmissions: () => fetchHandler(`${API_BASE_URL}/student/submissions`),
  },
};
