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
  {
    name: "Binary Search",
    count: 356,
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
  {
    name: "Tree",
    count: 445,
    color: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
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
  {
    id: 20,
    title: "Valid Parentheses",
    difficulty: "Easy",
    acceptance: "40.1%",
    frequency: "Very High",
    tags: ["String", "Stack"],
    solved: false,
    premium: false,
  },
  {
    id: 21,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    acceptance: "62.5%",
    frequency: "High",
    tags: ["Linked List", "Recursion"],
    solved: false,
    premium: false,
  },
  {
    id: 53,
    title: "Maximum Subarray",
    difficulty: "Medium",
    acceptance: "50.1%",
    frequency: "Very High",
    tags: ["Array", "Dynamic Programming"],
    solved: false,
    premium: false,
  },
  {
    id: 121,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    acceptance: "54.2%",
    frequency: "Very High",
    tags: ["Array", "Dynamic Programming"],
    solved: false,
    premium: false,
  },
  {
    id: 206,
    title: "Reverse Linked List",
    difficulty: "Easy",
    acceptance: "72.8%",
    frequency: "Very High",
    tags: ["Linked List", "Recursion"],
    solved: false,
    premium: false,
  },
  {
    id: 15,
    title: "3Sum",
    difficulty: "Medium",
    acceptance: "32.9%",
    frequency: "High",
    tags: ["Array", "Two Pointers", "Sorting"],
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
        explanation:
          "121 reads as 121 from left to right and from right to left.",
      },
      {
        input: "x = -121",
        output: "false",
        explanation:
          "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.",
      },
      {
        input: "x = 10",
        output: "false",
        explanation:
          "Reads 01 from right to left. Therefore it is not a palindrome.",
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
  20: {
    id: 20,
    title: "Valid Parentheses",
    description: `Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.

An input string is valid if:
<ol>
<li>Open brackets must be closed by the same type of brackets.</li>
<li>Open brackets must be closed in the correct order.</li>
<li>Every close bracket has a corresponding open bracket of the same type.</li>
</ol>`,
    examples: [
      {
        input: 's = "()"',
        output: "true",
        explanation: "",
      },
      {
        input: 's = "()[]{}"',
        output: "true",
        explanation: "",
      },
      {
        input: 's = "(]"',
        output: "false",
        explanation: "",
      },
    ],
    constraints: [
      "1 ≤ s.length ≤ 10⁴",
      "s consists of parentheses only '()[]{}'.",
    ],
    testCases: [
      {
        input: '"()"',
        expectedOutput: "true",
      },
      {
        input: '"()[]{}"',
        expectedOutput: "true",
      },
      {
        input: '"(]"',
        expectedOutput: "false",
      },
    ],
    templates: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    
};`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        
    }
};`,
    },
  },
  21: {
    id: 21,
    title: "Merge Two Sorted Lists",
    description: `You are given the heads of two sorted linked lists <code>list1</code> and <code>list2</code>.

Merge the two lists into one <strong>sorted</strong> list. The list should be made by splicing together the nodes of the first two lists.

Return <em>the head of the merged linked list</em>.`,
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]",
        explanation: "",
      },
      {
        input: "list1 = [], list2 = []",
        output: "[]",
        explanation: "",
      },
      {
        input: "list1 = [], list2 = [0]",
        output: "[0]",
        explanation: "",
      },
    ],
    constraints: [
      "The number of nodes in both lists is in the range [0, 50].",
      "-100 ≤ Node.val ≤ 100",
      "Both list1 and list2 are sorted in non-decreasing order.",
    ],
    testCases: [
      {
        input: "[1,2,4]\n[1,3,4]",
        expectedOutput: "[1,1,2,3,4,4]",
      },
      {
        input: "[]\n[]",
        expectedOutput: "[]",
      },
      {
        input: "[]\n[0]",
        expectedOutput: "[0]",
      },
    ],
    templates: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    
};`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        pass`,
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        
    }
}`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
        
    }
};`,
    },
  },
  53: {
    id: 53,
    title: "Maximum Subarray",
    description: `Given an integer array <code>nums</code>, find the <strong>subarray</strong> with the largest sum, and return <em>its sum</em>.`,
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "The subarray [1] has the largest sum 1.",
      },
      {
        input: "nums = [5,4,-1,7,8]",
        output: "23",
        explanation: "The subarray [5,4,-1,7,8] has the largest sum 23.",
      },
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    testCases: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        expectedOutput: "6",
      },
      {
        input: "[1]",
        expectedOutput: "1",
      },
      {
        input: "[5,4,-1,7,8]",
        expectedOutput: "23",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    
};`,
      python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        
    }
};`,
    },
  },
  121: {
    id: 121,
    title: "Best Time to Buy and Sell Stock",
    description: `You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i<sup>th</sup></code> day.

You want to maximize your profit by choosing a <strong>single day</strong> to buy one stock and choosing a <strong>different day in the future</strong> to sell that stock.

Return <em>the maximum profit you can achieve from this transaction</em>. If you cannot achieve any profit, return <code>0</code>.`,
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation:
          "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
      },
      {
        input: "prices = [7,6,4,3,1]",
        output: "0",
        explanation:
          "In this case, no transactions are done and the max profit = 0.",
      },
    ],
    constraints: ["1 ≤ prices.length ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"],
    testCases: [
      {
        input: "[7,1,5,3,6,4]",
        expectedOutput: "5",
      },
      {
        input: "[7,6,4,3,1]",
        expectedOutput: "0",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    
};`,
      python: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        pass`,
      java: `class Solution {
    public int maxProfit(int[] prices) {
        
    }
}`,
      cpp: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        
    }
};`,
    },
  },
  206: {
    id: 206,
    title: "Reverse Linked List",
    description: `Given the <code>head</code> of a singly linked list, reverse the list, and return <em>the reversed list</em>.`,
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "",
      },
      {
        input: "head = [1,2]",
        output: "[2,1]",
        explanation: "",
      },
      {
        input: "head = []",
        output: "[]",
        explanation: "",
      },
    ],
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 ≤ Node.val ≤ 5000",
    ],
    testCases: [
      {
        input: "[1,2,3,4,5]",
        expectedOutput: "[5,4,3,2,1]",
      },
      {
        input: "[1,2]",
        expectedOutput: "[2,1]",
      },
      {
        input: "[]",
        expectedOutput: "[]",
      },
    ],
    templates: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    
};`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        pass`,
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode reverseList(ListNode head) {
        
    }
}`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        
    }
};`,
    },
  },
  15: {
    id: 15,
    title: "3Sum",
    description: `Given an integer array nums, return all the triplets <code>[nums[i], nums[j], nums[k]]</code> such that <code>i != j</code>, <code>i != k</code>, and <code>j != k</code>, and <code>nums[i] + nums[j] + nums[k] == 0</code>.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
        explanation: `nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.
The distinct triplets are [-1,0,1] and [-1,-1,2].`,
      },
      {
        input: "nums = [0,1,1]",
        output: "[]",
        explanation: "The only possible triplet does not sum up to 0.",
      },
      {
        input: "nums = [0,0,0]",
        output: "[[0,0,0]]",
        explanation: "The only possible triplet sums up to 0.",
      },
    ],
    constraints: ["3 ≤ nums.length ≤ 3000", "-10⁵ ≤ nums[i] ≤ 10⁵"],
    testCases: [
      {
        input: "[-1,0,1,2,-1,-4]",
        expectedOutput: "[[-1,-1,2],[-1,0,1]]",
      },
      {
        input: "[0,1,1]",
        expectedOutput: "[]",
      },
      {
        input: "[0,0,0]",
        expectedOutput: "[[0,0,0]]",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    
};`,
      python: `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        pass`,
      java: `class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        
    }
};`,
    },
  },
  217: {
    id: 217,
    title: "Contains Duplicate",
    description: `Given an integer array <code>nums</code>, return <code>true</code> if any value appears <strong>at least twice</strong> in the array, and return <code>false</code> if every element is distinct.`,
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "true",
        explanation: "",
      },
      {
        input: "nums = [1,2,3,4]",
        output: "false",
        explanation: "",
      },
      {
        input: "nums = [1,1,1,3,3,4,3,2,4,2]",
        output: "true",
        explanation: "",
      },
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁹ ≤ nums[i] ≤ 10⁹"],
    testCases: [
      {
        input: "[1,2,3,1]",
        expectedOutput: "true",
      },
      {
        input: "[1,2,3,4]",
        expectedOutput: "false",
      },
      {
        input: "[1,1,1,3,3,4,3,2,4,2]",
        expectedOutput: "true",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
var containsDuplicate = function(nums) {
    
};`,
      python: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        pass`,
      java: `class Solution {
    public boolean containsDuplicate(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        
    }
};`,
    },
  },
  242: {
    id: 242,
    title: "Valid Anagram",
    description: `Given two strings <code>s</code> and <code>t</code>, return <code>true</code> <em>if</em> <code>t</code> <em>is an anagram of</em> <code>s</code>, <em>and</em> <code>false</code> <em>otherwise</em>.

An <strong>Anagram</strong> is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: "true",
        explanation: "",
      },
      {
        input: 's = "rat", t = "car"',
        output: "false",
        explanation: "",
      },
    ],
    constraints: [
      "1 ≤ s.length, t.length ≤ 5 * 10⁴",
      "s and t consist of lowercase English letters.",
    ],
    testCases: [
      {
        input: '"anagram"\n"nagaram"',
        expectedOutput: "true",
      },
      {
        input: '"rat"\n"car"',
        expectedOutput: "false",
      },
    ],
    templates: {
      javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
var isAnagram = function(s, t) {
    
};`,
      python: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        pass`,
      java: `class Solution {
    public boolean isAnagram(String s, String t) {
        
    }
}`,
      cpp: `class Solution {
public:
    bool isAnagram(string s, string t) {
        
    }
};`,
    },
  },
  104: {
    id: 104,
    title: "Maximum Depth of Binary Tree",
    description: `Given the <code>root</code> of a binary tree, return <em>its maximum depth</em>.

A binary tree's <strong>maximum depth</strong> is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "3",
        explanation: "",
      },
      {
        input: "root = [1,null,2]",
        output: "2",
        explanation: "",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 10⁴].",
      "-100 ≤ Node.val ≤ 100",
    ],
    testCases: [
      {
        input: "[3,9,20,null,null,15,7]",
        expectedOutput: "3",
      },
      {
        input: "[1,null,2]",
        expectedOutput: "2",
      },
    ],
    templates: {
      javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var maxDepth = function(root) {
    
};`,
      python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        pass`,
      java: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public int maxDepth(TreeNode root) {
        
    }
}`,
      cpp: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    int maxDepth(TreeNode* root) {
        
    }
};`,
    },
  },
  226: {
    id: 226,
    title: "Invert Binary Tree",
    description: `Given the <code>root</code> of a binary tree, invert the tree, and return <em>its root</em>.`,
    examples: [
      {
        input: "root = [4,2,7,1,3,6,9]",
        output: "[4,7,2,9,6,3,1]",
        explanation: "",
      },
      {
        input: "root = [2,1,3]",
        output: "[2,3,1]",
        explanation: "",
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 ≤ Node.val ≤ 100",
    ],
    testCases: [
      {
        input: "[4,2,7,1,3,6,9]",
        expectedOutput: "[4,7,2,9,6,3,1]",
      },
      {
        input: "[2,1,3]",
        expectedOutput: "[2,3,1]",
      },
      {
        input: "[]",
        expectedOutput: "[]",
      },
    ],
    templates: {
      javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
var invertTree = function(root) {
    
};`,
      python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        pass`,
      java: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public TreeNode invertTree(TreeNode root) {
        
    }
}`,
      cpp: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        
    }
};`,
    },
  },
  70: {
    id: 70,
    title: "Climbing Stairs",
    description: `You are climbing a staircase. It takes <code>n</code> steps to reach the top.

Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?`,
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation:
          "There are two ways to climb to the top: 1. 1 step + 1 step, 2. 2 steps",
      },
      {
        input: "n = 3",
        output: "3",
        explanation:
          "There are three ways to climb to the top: 1. 1 step + 1 step + 1 step, 2. 1 step + 2 steps, 3. 2 steps + 1 step",
      },
    ],
    constraints: ["1 ≤ n ≤ 45"],
    testCases: [
      {
        input: "2",
        expectedOutput: "2",
      },
      {
        input: "3",
        expectedOutput: "3",
      },
      {
        input: "5",
        expectedOutput: "8",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    
};`,
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        pass`,
      java: `class Solution {
    public int climbStairs(int n) {
        
    }
}`,
      cpp: `class Solution {
public:
    int climbStairs(int n) {
        
    }
};`,
    },
  },
  198: {
    id: 198,
    title: "House Robber",
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and <strong>it will automatically contact the police if two adjacent houses were broken into on the same night</strong>.

Given an integer array <code>nums</code> representing the amount of money of each house, return <em>the maximum amount of money you can rob tonight <strong>without alerting the police</strong></em>.`,
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "4",
        explanation:
          "Rob house 1 (money = 1) and then rob house 3 (money = 3). Total amount you can rob = 1 + 3 = 4.",
      },
      {
        input: "nums = [2,7,9,3,1]",
        output: "12",
        explanation:
          "Rob house 1 (money = 2), rob house 3 (money = 9) and rob house 5 (money = 1). Total amount you can rob = 2 + 9 + 1 = 12.",
      },
    ],
    constraints: ["1 ≤ nums.length ≤ 100", "0 ≤ nums[i] ≤ 400"],
    testCases: [
      {
        input: "[1,2,3,1]",
        expectedOutput: "4",
      },
      {
        input: "[2,7,9,3,1]",
        expectedOutput: "12",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var rob = function(nums) {
    
};`,
      python: `class Solution:
    def rob(self, nums: List[int]) -> int:
        pass`,
      java: `class Solution {
    public int rob(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    int rob(vector<int>& nums) {
        
    }
};`,
    },
  },
  136: {
    id: 136,
    title: "Single Number",
    description: `Given a <strong>non-empty</strong> array of integers <code>nums</code>, every element appears <em>twice</em> except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.`,
    examples: [
      {
        input: "nums = [2,2,1]",
        output: "1",
        explanation: "",
      },
      {
        input: "nums = [4,1,2,1,2]",
        output: "4",
        explanation: "",
      },
      {
        input: "nums = [1]",
        output: "1",
        explanation: "",
      },
    ],
    constraints: [
      "1 ≤ nums.length ≤ 3 * 10⁴",
      "-3 * 10⁴ ≤ nums[i] ≤ 3 * 10⁴",
      "Each element in the array appears twice except for one element which appears only once.",
    ],
    testCases: [
      {
        input: "[2,2,1]",
        expectedOutput: "1",
      },
      {
        input: "[4,1,2,1,2]",
        expectedOutput: "4",
      },
      {
        input: "[1]",
        expectedOutput: "1",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function(nums) {
    
};`,
      python: `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        pass`,
      java: `class Solution {
    public int singleNumber(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    int singleNumber(vector<int>& nums) {
        
    }
};`,
    },
  },
  283: {
    id: 283,
    title: "Move Zeroes",
    description: `Given an integer array <code>nums</code>, move all <code>0</code>'s to the end of it while maintaining the relative order of the non-zero elements.

<strong>Note</strong> that you must do this in-place without making a copy of the array.`,
    examples: [
      {
        input: "nums = [0,1,0,3,12]",
        output: "[1,3,12,0,0]",
        explanation: "",
      },
      {
        input: "nums = [0]",
        output: "[0]",
        explanation: "",
      },
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁴", "-2³¹ ≤ nums[i] ≤ 2³¹ - 1"],
    testCases: [
      {
        input: "[0,1,0,3,12]",
        expectedOutput: "[1,3,12,0,0]",
      },
      {
        input: "[0]",
        expectedOutput: "[0]",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number[]} nums
 * @return {void} Do not return anything, modify nums in-place instead.
 */
var moveZeroes = function(nums) {
    
};`,
      python: `class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        pass`,
      java: `class Solution {
    public void moveZeroes(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    void moveZeroes(vector<int>& nums) {
        
    }
};`,
    },
  },
  344: {
    id: 344,
    title: "Reverse String",
    description: `Write a function that reverses a string. The input string is given as an array of characters <code>s</code>.

You must do this by modifying the input array <strong>in-place</strong> with <code>O(1)</code> extra memory.`,
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: "",
      },
      {
        input: 's = ["H","a","n","n","a","h"]',
        output: '["h","a","n","n","a","H"]',
        explanation: "",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁵", "s[i] is a printable ascii character."],
    testCases: [
      {
        input: '["h","e","l","l","o"]',
        expectedOutput: '["o","l","l","e","h"]',
      },
      {
        input: '["H","a","n","n","a","h"]',
        expectedOutput: '["h","a","n","n","a","H"]',
      },
    ],
    templates: {
      javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
var reverseString = function(s) {
    
};`,
      python: `class Solution:
    def reverseString(self, s: List[str]) -> None:
        """
        Do not return anything, modify s in-place instead.
        """
        pass`,
      java: `class Solution {
    public void reverseString(char[] s) {
        
    }
}`,
      cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        
    }
};`,
    },
  },
  167: {
    id: 167,
    title: "Two Sum II - Input Array Is Sorted",
    description: `Given a <strong>1-indexed</strong> array of integers <code>numbers</code> that is already <strong>sorted in non-decreasing order</strong>, find two numbers such that they add up to a specific <code>target</code> number. Let these two numbers be <code>numbers[index1]</code> and <code>numbers[index2]</code> where <code>1 <= index1 < index2 <= numbers.length</code>.

Return <em>the indices of the two numbers, <code>index1</code> and <code>index2</code>, <strong>added by one</strong> as an integer array <code>[index1, index2]</code> of length 2</em>.

The tests are generated such that there is <strong>exactly one solution</strong>. You <strong>may not</strong> use the same element twice.

Your solution must use only constant extra space.`,
    examples: [
      {
        input: "numbers = [2,7,11,15], target = 9",
        output: "[1,2]",
        explanation:
          "The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2].",
      },
      {
        input: "numbers = [2,3,4], target = 6",
        output: "[1,3]",
        explanation:
          "The sum of 2 and 4 is 6. Therefore index1 = 1, index2 = 3. We return [1, 3].",
      },
      {
        input: "numbers = [-1,0], target = -1",
        output: "[1,2]",
        explanation:
          "The sum of -1 and 0 is -1. Therefore index1 = 1, index2 = 2. We return [1, 2].",
      },
    ],
    constraints: [
      "2 ≤ numbers.length ≤ 3 * 10⁴",
      "-1000 ≤ numbers[i] ≤ 1000",
      "numbers is sorted in non-decreasing order.",
      "-1000 ≤ target ≤ 1000",
      "The tests are generated such that there is exactly one solution.",
    ],
    testCases: [
      {
        input: "[2,7,11,15]\n9",
        expectedOutput: "[1,2]",
      },
      {
        input: "[2,3,4]\n6",
        expectedOutput: "[1,3]",
      },
      {
        input: "[-1,0]\n-1",
        expectedOutput: "[1,2]",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number[]} numbers
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(numbers, target) {
    
};`,
      python: `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] numbers, int target) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        
    }
};`,
    },
  },
  125: {
    id: 125,
    title: "Valid Palindrome",
    description: `A phrase is a <strong>palindrome</strong> if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string <code>s</code>, return <code>true</code> <em>if it is a <strong>palindrome</strong>, or</em> <code>false</code> <em>otherwise</em>.`,
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        input: 's = "race a car"',
        output: "false",
        explanation: '"raceacar" is not a palindrome.',
      },
      {
        input: 's = " "',
        output: "true",
        explanation:
          's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.',
      },
    ],
    constraints: [
      "1 ≤ s.length ≤ 2 * 10⁵",
      "s consists only of printable ASCII characters.",
    ],
    testCases: [
      {
        input: '"A man, a plan, a canal: Panama"',
        expectedOutput: "true",
      },
      {
        input: '"race a car"',
        expectedOutput: "false",
      },
      {
        input: '" "',
        expectedOutput: "true",
      },
    ],
    templates: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isPalindrome = function(s) {
    
};`,
      python: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        pass`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        
    }
}`,
      cpp: `class Solution {
public:
    bool isPalindrome(string s) {
        
    }
};`,
    },
  },
  448: {
    id: 448,
    title: "Find All Numbers Disappeared in an Array",
    description: `Given an array <code>nums</code> of <code>n</code> integers where <code>nums[i]</code> is in the range <code>[1, n]</code>, return <em>an array of all the integers in the range</em> <code>[1, n]</code> <em>that do not appear in</em> <code>nums</code>.`,
    examples: [
      {
        input: "nums = [4,3,2,7,8,2,3,1]",
        output: "[5,6]",
        explanation: "",
      },
      {
        input: "nums = [1,1]",
        output: "[2]",
        explanation: "",
      },
    ],
    constraints: ["n == nums.length", "1 ≤ n ≤ 10⁵", "1 ≤ nums[i] ≤ n"],
    testCases: [
      {
        input: "[4,3,2,7,8,2,3,1]",
        expectedOutput: "[5,6]",
      },
      {
        input: "[1,1]",
        expectedOutput: "[2]",
      },
    ],
    templates: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
var findDisappearedNumbers = function(nums) {
    
};`,
      python: `class Solution:
    def findDisappearedNumbers(self, nums: List[int]) -> List[int]:
        pass`,
      java: `class Solution {
    public List<Integer> findDisappearedNumbers(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> findDisappearedNumbers(vector<int>& nums) {
        
    }
};`,
    },
  },
  141: {
    id: 141,
    title: "Linked List Cycle",
    description: `Given <code>head</code>, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the <code>next</code> pointer. Internally, <code>pos</code> is used to denote the index of the node that tail's <code>next</code> pointer is connected to. <strong>Note that <code>pos</code> is not passed as a parameter</strong>.

Return <code>true</code> <em>if there is a cycle in the linked list</em>. Otherwise, return <code>false</code>.`,
    examples: [
      {
        input: "head = [3,2,0,-4], pos = 1",
        output: "true",
        explanation:
          "There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).",
      },
      {
        input: "head = [1,2], pos = 0",
        output: "true",
        explanation:
          "There is a cycle in the linked list, where the tail connects to the 0th node.",
      },
      {
        input: "head = [1], pos = -1",
        output: "false",
        explanation: "There is no cycle in the linked list.",
      },
    ],
    constraints: [
      "The number of the nodes in the list is in the range [0, 10⁴].",
      "-10⁵ ≤ Node.val ≤ 10⁵",
      "pos is -1 or a valid index in the linked-list.",
    ],
    testCases: [
      {
        input: "[3,2,0,-4]\n1",
        expectedOutput: "true",
      },
      {
        input: "[1,2]\n0",
        expectedOutput: "true",
      },
      {
        input: "[1]\n-1",
        expectedOutput: "false",
      },
    ],
    templates: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val) {
 *     this.val = val;
 *     this.next = null;
 * }
 */

/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function(head) {
    
};`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        pass`,
      java: `/**
 * Definition for singly-linked list.
 * class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode(int x) {
 *         val = x;
 *         next = null;
 *     }
 * }
 */
public class Solution {
    public boolean hasCycle(ListNode head) {
        
    }
}`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    bool hasCycle(ListNode *head) {
        
    }
};`,
    },
  },
  234: {
    id: 234,
    title: "Palindrome Linked List",
    description: `Given the <code>head</code> of a singly linked list, return <code>true</code> <em>if it is a palindrome or</em> <code>false</code> <em>otherwise</em>.`,
    examples: [
      {
        input: "head = [1,2,2,1]",
        output: "true",
        explanation: "",
      },
      {
        input: "head = [1,2]",
        output: "false",
        explanation: "",
      },
    ],
    constraints: [
      "The number of nodes in the list is in the range [1, 10⁵].",
      "0 ≤ Node.val ≤ 9",
    ],
    testCases: [
      {
        input: "[1,2,2,1]",
        expectedOutput: "true",
      },
      {
        input: "[1,2]",
        expectedOutput: "false",
      },
    ],
    templates: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {boolean}
 */
var isPalindrome = function(head) {
    
};`,
      python: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        pass`,
      java: `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public boolean isPalindrome(ListNode head) {
        
    }
}`,
      cpp: `/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    bool isPalindrome(ListNode* head) {
        
    }
};`,
    },
  },
  543: {
    id: 543,
    title: "Diameter of Binary Tree",
    description: `Given the <code>root</code> of a binary tree, return <em>the length of the <strong>diameter</strong> of the tree</em>.

The <strong>diameter</strong> of a binary tree is the <strong>length</strong> of the longest path between any two nodes in a tree. This path may or may not pass through the <code>root</code>.

The <strong>length</strong> of a path between two nodes is represented by the number of edges between them.`,
    examples: [
      {
        input: "root = [1,2,3,4,5]",
        output: "3",
        explanation: "3 is the length of the path [4,2,1,3] or [5,2,1,3].",
      },
      {
        input: "root = [1,2]",
        output: "1",
        explanation: "",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [1, 10⁴].",
      "-100 ≤ Node.val ≤ 100",
    ],
    testCases: [
      {
        input: "[1,2,3,4,5]",
        expectedOutput: "3",
      },
      {
        input: "[1,2]",
        expectedOutput: "1",
      },
    ],
    templates: {
      javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number}
 */
var diameterOfBinaryTree = function(root) {
    
};`,
      python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        pass`,
      java: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public int diameterOfBinaryTree(TreeNode root) {
        
    }
}`,
      cpp: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    int diameterOfBinaryTree(TreeNode* root) {
        
    }
};`,
    },
  },
  102: {
    id: 102,
    title: "Binary Tree Level Order Traversal",
    description: `Given the <code>root</code> of a binary tree, return <em>the level order traversal of its nodes' values</em>. (i.e., from left to right, level by level).`,
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "[[3],[9,20],[15,7]]",
        explanation: "",
      },
      {
        input: "root = [1]",
        output: "[[1]]",
        explanation: "",
      },
      {
        input: "root = []",
        output: "[]",
        explanation: "",
      },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [0, 2000].",
      "-1000 ≤ Node.val ≤ 1000",
    ],
    testCases: [
      {
        input: "[3,9,20,null,null,15,7]",
        expectedOutput: "[[3],[9,20],[15,7]]",
      },
      {
        input: "[1]",
        expectedOutput: "[[1]]",
      },
      {
        input: "[]",
        expectedOutput: "[]",
      },
    ],
    templates: {
      javascript: `/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */
/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
var levelOrder = function(root) {
    
};`,
      python: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        pass`,
      java: `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        
    }
}`,
      cpp: `/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        
    }
};`,
    },
  },
};
