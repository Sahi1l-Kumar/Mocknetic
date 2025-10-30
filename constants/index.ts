export const PROBLEM_TAGS = [
  { name: "All Topics", count: 3652, active: true },
  {
    name: "Array",
    count: 1977,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    name: "String",
    count: 809,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  {
    name: "Hash Table",
    count: 722,
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  {
    name: "Dynamic Programming",
    count: 609,
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  {
    name: "Math",
    count: 607,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  {
    name: "Sorting",
    count: 467,
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  },
  {
    name: "Greedy",
    count: 430,
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  },
  {
    name: "Depth-First Search",
    count: 389,
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  },
];

export const SAMPLE_PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    acceptance: "56.2%",
    frequency: "Very High",
    tags: ["Array", "Hash Table"],
    solved: true,
    premium: false,
  },
  {
    id: 2,
    title: "Add Two Numbers",
    difficulty: "Medium",
    acceptance: "46.8%",
    frequency: "High",
    tags: ["Linked List", "Math", "Recursion"],
    solved: false,
    premium: false,
  },
  {
    id: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    acceptance: "37.4%",
    frequency: "Very High",
    tags: ["Hash Table", "String", "Sliding Window"],
    solved: true,
    premium: false,
  },
  {
    id: 4,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    acceptance: "44.5%",
    frequency: "Medium",
    tags: ["Array", "Binary Search", "Divide and Conquer"],
    solved: false,
    premium: true,
  },
  {
    id: 5,
    title: "Container With Most Water",
    difficulty: "Medium",
    acceptance: "54.7%",
    frequency: "High",
    tags: ["Array", "Two Pointers"],
    solved: true,
    premium: false,
  },
  {
    id: 6,
    title: "3Sum",
    difficulty: "Medium",
    acceptance: "32.1%",
    frequency: "Very High",
    tags: ["Array", "Two Pointers", "Sorting"],
    solved: false,
    premium: false,
  },
  {
    id: 7,
    title: "Reverse Integer",
    difficulty: "Medium",
    acceptance: "25.8%",
    frequency: "Medium",
    tags: ["Math"],
    solved: true,
    premium: false,
  },
  {
    id: 8,
    title: "String to Integer (atoi)",
    difficulty: "Medium",
    acceptance: "16.4%",
    frequency: "Low",
    tags: ["String"],
    solved: false,
    premium: false,
  },
  {
    id: 9,
    title: "Palindrome Number",
    difficulty: "Easy",
    acceptance: "51.8%",
    frequency: "High",
    tags: ["Math"],
    solved: true,
    premium: false,
  },
  {
    id: 10,
    title: "Regular Expression Matching",
    difficulty: "Hard",
    acceptance: "27.9%",
    frequency: "Medium",
    tags: ["String", "Dynamic Programming", "Recursion"],
    solved: false,
    premium: false,
  },
  {
    id: 11,
    title: "Container With Most Water",
    difficulty: "Medium",
    acceptance: "54.7%",
    frequency: "High",
    tags: ["Array", "Two Pointers"],
    solved: true,
    premium: false,
  },
  {
    id: 12,
    title: "Integer to Roman",
    difficulty: "Medium",
    acceptance: "59.1%",
    frequency: "Low",
    tags: ["Hash Table", "Math", "String"],
    solved: false,
    premium: false,
  },
  {
    id: 13,
    title: "Roman to Integer",
    difficulty: "Easy",
    acceptance: "58.4%",
    frequency: "Medium",
    tags: ["Hash Table", "Math", "String"],
    solved: true,
    premium: false,
  },
  {
    id: 14,
    title: "Longest Common Prefix",
    difficulty: "Easy",
    acceptance: "40.1%",
    frequency: "High",
    tags: ["String", "Trie"],
    solved: false,
    premium: false,
  },
  {
    id: 15,
    title: "3Sum",
    difficulty: "Medium",
    acceptance: "32.1%",
    frequency: "Very High",
    tags: ["Array", "Two Pointers", "Sorting"],
    solved: true,
    premium: true,
  },
  {
    id: 16,
    title: "3Sum Closest",
    difficulty: "Medium",
    acceptance: "46.2%",
    frequency: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    solved: false,
    premium: false,
  },
  {
    id: 17,
    title: "Letter Combinations of a Phone Number",
    difficulty: "Medium",
    acceptance: "57.2%",
    frequency: "High",
    tags: ["Hash Table", "String", "Backtracking"],
    solved: true,
    premium: false,
  },
  {
    id: 18,
    title: "4Sum",
    difficulty: "Medium",
    acceptance: "35.8%",
    frequency: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    solved: false,
    premium: false,
  },
  {
    id: 19,
    title: "Remove Nth Node From End of List",
    difficulty: "Medium",
    acceptance: "39.0%",
    frequency: "High",
    tags: ["Linked List", "Two Pointers"],
    solved: true,
    premium: false,
  },
  {
    id: 20,
    title: "Valid Parentheses",
    difficulty: "Easy",
    acceptance: "40.7%",
    frequency: "Very High",
    tags: ["String", "Stack"],
    solved: false,
    premium: true,
  },
  // Adding 30+ more problems for scrolling test
  {
    id: 21,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    acceptance: "61.1%",
    frequency: "Very High",
    tags: ["Linked List", "Recursion"],
    solved: true,
    premium: false,
  },
  {
    id: 22,
    title: "Generate Parentheses",
    difficulty: "Medium",
    acceptance: "71.4%",
    frequency: "High",
    tags: ["String", "Dynamic Programming", "Backtracking"],
    solved: false,
    premium: false,
  },
  {
    id: 23,
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    acceptance: "47.1%",
    frequency: "High",
    tags: ["Linked List", "Divide and Conquer", "Heap (Priority Queue)", "Merge Sort"],
    solved: true,
    premium: false,
  },
  {
    id: 24,
    title: "Swap Nodes in Pairs",
    difficulty: "Medium",
    acceptance: "60.4%",
    frequency: "Medium",
    tags: ["Linked List", "Recursion"],
    solved: false,
    premium: false,
  },
  {
    id: 25,
    title: "Reverse Nodes in k-Group",
    difficulty: "Hard",
    acceptance: "52.8%",
    frequency: "Medium",
    tags: ["Linked List", "Recursion"],
    solved: true,
    premium: true,
  },
  {
    id: 26,
    title: "Remove Duplicates from Sorted Array",
    difficulty: "Easy",
    acceptance: "51.2%",
    frequency: "High",
    tags: ["Array", "Two Pointers"],
    solved: false,
    premium: false,
  },
  {
    id: 27,
    title: "Remove Element",
    difficulty: "Easy",
    acceptance: "52.0%",
    frequency: "Low",
    tags: ["Array", "Two Pointers"],
    solved: true,
    premium: false,
  },
  {
    id: 28,
    title: "Find the Index of the First Occurrence in a String",
    difficulty: "Easy",
    acceptance: "37.8%",
    frequency: "Medium",
    tags: ["Two Pointers", "String", "String Matching"],
    solved: false,
    premium: false,
  },
  {
    id: 29,
    title: "Divide Two Integers",
    difficulty: "Medium",
    acceptance: "17.5%",
    frequency: "Low",
    tags: ["Math", "Bit Manipulation"],
    solved: true,
    premium: false,
  },
  {
    id: 30,
    title: "Substring with Concatenation of All Words",
    difficulty: "Hard",
    acceptance: "30.9%",
    frequency: "Low",
    tags: ["Hash Table", "String", "Sliding Window"],
    solved: false,
    premium: true,
  },
  {
    id: 31,
    title: "Next Permutation",
    difficulty: "Medium",
    acceptance: "37.0%",
    frequency: "High",
    tags: ["Array", "Two Pointers"],
    solved: true,
    premium: false,
  },
  {
    id: 32,
    title: "Longest Valid Parentheses",
    difficulty: "Hard",
    acceptance: "32.7%",
    frequency: "Medium",
    tags: ["String", "Dynamic Programming", "Stack"],
    solved: false,
    premium: false,
  },
  {
    id: 33,
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    acceptance: "38.9%",
    frequency: "Very High",
    tags: ["Array", "Binary Search"],
    solved: true,
    premium: false,
  },
  {
    id: 34,
    title: "Find First and Last Position of Element in Sorted Array",
    difficulty: "Medium",
    acceptance: "42.2%",
    frequency: "High",
    tags: ["Array", "Binary Search"],
    solved: false,
    premium: false,
  },
  {
    id: 35,
    title: "Search Insert Position",
    difficulty: "Easy",
    acceptance: "42.8%",
    frequency: "High",
    tags: ["Array", "Binary Search"],
    solved: true,
    premium: true,
  },
];
export const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  csharp: 51,
  go: 60,
  rust: 73,
  php: 68,
  ruby: 72,
  swift: 83,
  kotlin: 78,
  typescript: 74,
} as const;

export const STATUS_IDS = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer", 
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error (SIGSEGV)",
  8: "Runtime Error (SIGXFSZ)",
  9: "Runtime Error (SIGFPE)",
  10: "Runtime Error (SIGABRT)",
  11: "Runtime Error (NZEC)",
  12: "Runtime Error (Other)",
  13: "Internal Error",
  14: "Exec Format Error"
} as const;

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
  testCases: {
    case: string;
    input: {
      nums: string;
      target: string;
    };
    expectedOutput: string;
  }[];
  templates: {
    [language: string]: string;
  };
}

export const PROBLEM_DATA: { [key: number]: ProblemData } = {
  1: {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1]."
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    testCases: [
      {
        case: "Case 1",
        input: {
          nums: "[2,7,11,15]",
          target: "9"
        },
        expectedOutput: "[0,1]"
      },
      {
        case: "Case 2",
        input: {
          nums: "[3,2,4]",
          target: "6"
        },
        expectedOutput: "[1,2]"
      },
      {
        case: "Case 3",
        input: {
          nums: "[3,3]",
          target: "6"
        },
        expectedOutput: "[0,1]"
      }
    ],
    templates: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        `,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`
    }
  }
};
