import { ProblemData } from "@/types/global";

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
    acceptance: "50.3%",
    frequency: "Very High",
    tags: ["Array", "Hash Table"],
    solved: true,
    premium: false,
  },
  {
    id: 9,
    title: "Palindrome Number",
    difficulty: "Easy",
    acceptance: "52.4%",
    frequency: "High",
    tags: ["Math"],
    solved: false,
    premium: false,
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
  14: "Exec Format Error",
} as const;

export const PROBLEM_DATA: { [key: number]: ProblemData } = {
  1: {
    id: 1,
    title: "Two Sum",
    description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>the indices of the two numbers such that they add up to</em> <code>target</code>.

You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
      {
        input: "nums = [3,3], target = 6",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 6, we return [0, 1].",
      },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists.",
    ],
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[0,1]",
      },
      {
        input: "[3,2,4]\n6",
        expectedOutput: "[1,2]",
      },
      {
        input: "[3,3]\n6",
        expectedOutput: "[0,1]",
      },
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
        pass`,
      
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,

      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`,
    },
  },
  9: {
    id: 9,
    title: "Palindrome Number",
    description: `Given an integer <code>x</code>, return <code>true</code> <em>if</em> <code>x</code> <em>is palindrome integer</em>.

An integer is a <strong>palindrome</strong> when it reads the same backward as forward.
<ul>
<li>For example, <code>121</code> is a palindrome while <code>123</code> is not.</li>
</ul>`,
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
      },
      {
        input: "x = 10",
        output: "false",
        explanation: "Reads 01 from right to left. Therefore it is not a palindrome.",
      },
    ],
    constraints: ["-2³¹ ≤ x ≤ 2³¹ - 1"],
    testCases: [
      {
        input: "121",
        expectedOutput: "true",
      },
      {
        input: "-121",
        expectedOutput: "false",
      },
      {
        input: "10",
        expectedOutput: "false",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    
};`,

      python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        pass`,

      java: `class Solution {
    public boolean isPalindrome(int x) {
        
    }
}`,

      cpp: `class Solution {
public:
    bool isPalindrome(int x) {
        
    }
};`,
    },
  },
};
