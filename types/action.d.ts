interface SignInWithOAuthParams {
  provider: "google";
  providerAccountId: string;
  user: {
    email: string;
    name: string;
    image: string;
    username: string;
    role?: "student" | "teacher";
  };
}

interface AuthCredentials {
  name: string;
  username: string;
  email: string;
  password: string;
  role?: "student" | "teacher";
}

interface CreateClassroomParams {
  name: string;
  description?: string;
  subject?: string;
}

interface JoinClassroomParams {
  code: string;
}

interface CreateClassroomAssessmentParams {
  classroomId: string;
  title: string;
  description?: string;
  curriculum: string;
  curriculumFile?: string;
  dueDate?: string;
  difficulty: "easy" | "medium" | "hard";
  totalQuestions: number;
}

interface ClassroomMembershipData {
  classroomId: string;
  studentId: string;
  enrolledAt: Date;
  status: "active" | "dropped" | "completed";
}
