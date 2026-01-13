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

type QuestionType =
  | "mcq"
  | "pseudo_mcq"
  | "descriptive"
  | "aptitude"
  | "reasoning"
  | "circuit_math";

interface QuestionPlan {
  type: QuestionType;
  count: number;
}

interface GeneratedQuestion {
  id: string;
  skill: string;
  questionType: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: number;
  difficulty: string;
  explanation?: string;
  expectedAnswer?: string;
  evaluationCriteria?: string;
  expectedKeywords?: string[];
}

interface ParsedResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string | null;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link: string | null;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface FileParserResponse {
  success: boolean;
  data?: ParsedResumeData & {
    resumeId: string;
    fileName: string;
  };
  error?: string;
}

interface GenerateQuestionsRequest {
  jobRole: string;
  difficulty: string;
  experienceLevel: string;
}

interface SubmitAnswersRequest {
  assessmentId: string;
  answers: Record<string, string | number>;
}

interface GenerateRecommendationsRequest {
  jobRole: string;
  experienceLevel: string;
  skillGaps: string[];
  overallScore: number;
}

interface ExecuteCodeRequest {
  code: string;
  language: string;
  input?: string;
  testCases?: Array<{ input: string; expectedOutput: string }>;
}

interface SubmitCodeRequest {
  codes: string[];
  language: string;
  testCases: TestCase[];
  problemId: number;
  problemTitle: string;
}

interface CheckStatusRequest {
  tokens: string[];
  expectedOutputs?: string[];
  submissionDbId?: string;
}

interface SubmitCodeResponse {
  submissionIds: string[];
  totalTestCases: number;
  submissionDbId: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

interface StatusResult {
  token: string;
  status: string;
  statusId: number;
  isPending: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  time: string | null;
  memory: number | null;
  error: string | null;
}

interface CheckStatusResponse {
  results: StatusResult[];
}

interface SubmitAnswersResponse {
  success: boolean;
  data?: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    questions: AssessmentQuestion[];
  };
  error?: string;
}

interface AssessmentQuestion {
  questionId: string;
  question: string;
  skill: string;
  questionType: QuestionType;
  options?: string[];
  userAnswer: number | string | null;
  correctAnswer?: number;
  expectedAnswer?: string;
  evaluationCriteria?: string;
  expectedKeywords?: string[];
  isCorrect: boolean;
}

interface RecommendationsResponse {
  success: boolean;
  data?: {
    recommendations: Recommendation[];
  };
  error?: string;
}

interface Recommendation {
  title: string;
  description: string;
  link: string;
  skill: string;
}

interface JoinClassroomResponse {
  classroom: {
    _id: string;
    name: string;
    subject?: string;
    code: string;
  };
  membership: {
    _id: string;
    classroomId: string;
    studentId: string;
    status: string;
    enrolledAt: Date;
  };
}

interface SkillResultsResponse {
  results: Array<{
    _id: string;
    jobRole: string;
    difficulty: string;
    overallScore: number;
    correctAnswers: number;
    totalQuestions: number;
    skillGaps: Array<{
      skill: string;
      gap: number;
      accuracy: number;
      questionsAnswered: number;
      correctAnswers: number;
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      link: string;
      skill: string;
    }>;
    questions: Array<AssessmentQuestion>;
    completedAt: string;
  }>;
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}
