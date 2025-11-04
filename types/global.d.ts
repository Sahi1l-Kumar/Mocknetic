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

export type Language = keyof typeof LANGUAGE_IDS;
export type StatusId = keyof typeof STATUS_IDS;

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface ExecutionResult {
  status: string;
  statusId: number;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  exit_code: number | null;
  exit_signal: number | null;
  message: string | null;
  created_at: string;
  finished_at: string | null;
  testResults?: TestResult[];
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  status: string;
  time: string | null;
  memory: number | null;
  error: string | null;
}

export interface ProblemData {
  id: number;
  title: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  constraints: string[];
  testCases: TestCase[];
  templates: {
    [language: string]: string;
  };
}