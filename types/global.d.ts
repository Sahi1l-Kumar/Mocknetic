type ActionResponse<T = null> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string[]>;
  };
  status?: number;
};

type SuccessResponse<T = null> = ActionResponse<T> & { success: true };
type ErrorResponse = ActionResponse<undefined> & { success: false };

type APIErrorResponse = NextResponse<ErrorResponse>;
type APIResponse<T = null> = NextResponse<SuccessResponse<T> | ErrorResponse>;

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface Chat {
  _id: string;
  author: Author;
  title: string;
  messages: Array<{
    sender: "user" | "ai";
    content: string;
    timestamp: Date;
    imageUrl?: string;
    detectedDisease?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface Question {
  id: string;
  skill: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: string;
}

interface Skill {
  id: string;
  name: string;
  level: string;
  icon: string;
}

interface AssessmentResult {
  skillGaps: Array<{
    skill: string;
    currentLevel: string;
    requiredLevel: string;
    gap: number;
  }>;
  overallScore: number;
  recommendations: Array<{
    title: string;
    description: string;
    link: string;
    skill: string;
  }>;
}