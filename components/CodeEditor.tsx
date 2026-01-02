"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Sun,
  Moon,
  Play,
  Copy,
  Check,
  Terminal,
  FileText,
  Zap,
  Maximize2,
  Minimize2,
  Settings,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROBLEM_DATA } from "@/constants";
import type {
  APIResponse,
  ExecutionResult,
  TestCase,
  TestResult,
} from "@/types/global";

const FONT_SIZES = [12, 14, 16, 18, 20, 24];

interface LanguageOption {
  label: string;
  value: string;
  icon: string;
  template: string;
}

interface Props {
  testCases: TestCase[];
  problemId?: number;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  isFullscreen?: boolean;
}

export default function CodeEditor({
  testCases,
  problemId = 1,
  onFullscreenToggle,
  isFullscreen,
}: Props) {
  const [language, setLanguage] = useState<string>("javascript");
  const [theme, setTheme] = useState<"vs-dark" | "vs-light">("vs-dark");
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("testcase");
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const editorRef = useRef<any>(null);
  const testContentRef = useRef<HTMLDivElement>(null);

  const currentProblem = PROBLEM_DATA[problemId as keyof typeof PROBLEM_DATA];

  const LANGUAGES = React.useMemo<LanguageOption[]>(
    () =>
      currentProblem
        ? Object.entries(currentProblem.templates || {}).map(
            ([key, template]) => ({
              label: key.charAt(0).toUpperCase() + key.slice(1),
              value: key,
              icon:
                {
                  javascript: "🟨",
                  python: "🐍",
                  java: "☕",
                  cpp: "⚡",
                  typescript: "📘",
                  csharp: "#️⃣",
                  go: "🐹",
                  rust: "🦀",
                  php: "🐘",
                  ruby: "💎",
                }[key as string] || "📝",
              template: template as string,
            })
          )
        : [],
    [currentProblem]
  );

  useEffect(() => {
    if (LANGUAGES.length > 0) {
      const firstLang = LANGUAGES[0];
      setLanguage(firstLang.value);
      setCode(firstLang.template);
    }
  }, [problemId]);

  useEffect(() => {
    const selectedLang = LANGUAGES.find((lang) => lang.value === language);
    if (selectedLang) {
      setCode(selectedLang.template);
    }
  }, [language, LANGUAGES]);

  useEffect(() => {
    if (testContentRef.current) {
      testContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const wrapCodeForExecution = (
    userCode: string,
    testCase: TestCase
  ): string => {
    const { input } = testCase;

    switch (language) {
      case "javascript":
        return wrapJavaScript(userCode, input, problemId);
      case "python":
        return wrapPython(userCode, input, problemId);
      case "java":
        return wrapJava(userCode, input, problemId);
      case "cpp":
        return wrapCpp(userCode, input, problemId);
      default:
        return userCode;
    }
  };

  const wrapJavaScript = (
    userCode: string,
    input: string,
    problemId: number
  ): string => {
    const lines = input.split("\n");

    switch (problemId) {
      case 1: // Two Sum
        return `${userCode}
const nums = ${lines[0]};
const target = ${lines[1]};
console.log(JSON.stringify(twoSum(nums, target)));`;

      case 9: // Palindrome Number
        return `${userCode}
const x = ${input};
console.log(isPalindrome(x));`;

      case 20: // Valid Parentheses
        return `${userCode}
const s = ${input};
console.log(isValid(s));`;

      case 21: // Merge Two Sorted Lists
        return `${userCode}
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}
function arrayToList(arr) {
    if (!arr || arr.length === 0) return null;
    let head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) {
        curr.next = new ListNode(arr[i]);
        curr = curr.next;
    }
    return head;
}
function listToArray(head) {
    let result = [];
    while (head) {
        result.push(head.val);
        head = head.next;
    }
    return result;
}
const list1 = arrayToList(${lines[0]});
const list2 = arrayToList(${lines[1]});
console.log(JSON.stringify(listToArray(mergeTwoLists(list1, list2))));`;

      case 53: // Maximum Subarray
        return `${userCode}
const nums = ${input};
console.log(maxSubArray(nums));`;

      case 121: // Best Time to Buy and Sell Stock
        return `${userCode}
const prices = ${input};
console.log(maxProfit(prices));`;

      case 206: // Reverse Linked List
        return `${userCode}
function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}
function arrayToList(arr) {
    if (!arr || arr.length === 0) return null;
    let head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) {
        curr.next = new ListNode(arr[i]);
        curr = curr.next;
    }
    return head;
}
function listToArray(head) {
    let result = [];
    while (head) {
        result.push(head.val);
        head = head.next;
    }
    return result;
}
const head = arrayToList(${input});
console.log(JSON.stringify(listToArray(reverseList(head))));`;

      case 15: // 3Sum
        return `${userCode}
const nums = ${input};
console.log(JSON.stringify(threeSum(nums)));`;

      default:
        return userCode;
    }
  };

  const wrapPython = (
    userCode: string,
    input: string,
    problemId: number
  ): string => {
    const lines = input.split("\n");

    switch (problemId) {
      case 1: // Two Sum
        return `${userCode}
nums = ${lines[0]}
target = ${lines[1]}
solution = Solution()
print(solution.twoSum(nums, target))`;

      case 9: // Palindrome Number
        return `${userCode}
x = ${input}
solution = Solution()
print(solution.isPalindrome(x))`;

      case 20: // Valid Parentheses
        return `${userCode}
s = ${input}
solution = Solution()
print(solution.isValid(s))`;

      case 21: // Merge Two Sorted Lists
        return `${userCode}
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def array_to_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    curr = head
    for i in range(1, len(arr)):
        curr.next = ListNode(arr[i])
        curr = curr.next
    return head

def list_to_array(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

list1 = array_to_list(${lines[0]})
list2 = array_to_list(${lines[1]})
solution = Solution()
print(list_to_array(solution.mergeTwoLists(list1, list2)))`;

      case 53: // Maximum Subarray
        return `${userCode}
nums = ${input}
solution = Solution()
print(solution.maxSubArray(nums))`;

      case 121: // Best Time to Buy and Sell Stock
        return `${userCode}
prices = ${input}
solution = Solution()
print(solution.maxProfit(prices))`;

      case 206: // Reverse Linked List
        return `${userCode}
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def array_to_list(arr):
    if not arr:
        return None
    head = ListNode(arr[0])
    curr = head
    for i in range(1, len(arr)):
        curr.next = ListNode(arr[i])
        curr = curr.next
    return head

def list_to_array(head):
    result = []
    while head:
        result.append(head.val)
        head = head.next
    return result

head = array_to_list(${input})
solution = Solution()
print(list_to_array(solution.reverseList(head)))`;

      case 15: // 3Sum
        return `${userCode}
nums = ${input}
solution = Solution()
print(solution.threeSum(nums))`;

      default:
        return userCode;
    }
  };

  const wrapJava = (
    userCode: string,
    input: string,
    problemId: number
  ): string => {
    const lines = input.split("\n");

    switch (problemId) {
      case 1: // Two Sum
        const nums1 = lines[0].slice(1, -1);
        return `${userCode}
class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {${nums1}};
        int target = ${lines[1]};
        int[] result = sol.twoSum(nums, target);
        System.out.println("[" + result[0] + "," + result[1] + "]");
    }
}`;

      case 9: // Palindrome Number
        return `${userCode}
class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isPalindrome(${input}));
    }
}`;

      case 20: // Valid Parentheses
        return `${userCode}
class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isValid(${input}));
    }
}`;

      case 21: // Merge Two Sorted Lists
        const list1Arr = lines[0].slice(1, -1);
        const list2Arr = lines[1].slice(1, -1);
        return `${userCode}
class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode() {}
        ListNode(int val) { this.val = val; }
        ListNode(int val, ListNode next) { this.val = val; this.next = next; }
    }
    
    static ListNode arrayToList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for (int i = 1; i < arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }
    
    static String listToString(ListNode head) {
        StringBuilder sb = new StringBuilder("[");
        while (head != null) {
            sb.append(head.val);
            if (head.next != null) sb.append(",");
            head = head.next;
        }
        sb.append("]");
        return sb.toString();
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] arr1 = {${list1Arr}};
        int[] arr2 = {${list2Arr}};
        ListNode list1 = arrayToList(arr1);
        ListNode list2 = arrayToList(arr2);
        System.out.println(listToString(sol.mergeTwoLists(list1, list2)));
    }
}`;

      case 53: // Maximum Subarray
        const nums53 = input.slice(1, -1);
        return `${userCode}
class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {${nums53}};
        System.out.println(sol.maxSubArray(nums));
    }
}`;

      case 121: // Best Time to Buy and Sell Stock
        const prices121 = input.slice(1, -1);
        return `${userCode}
class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] prices = {${prices121}};
        System.out.println(sol.maxProfit(prices));
    }
}`;

      case 206: // Reverse Linked List
        const nums206 = input.slice(1, -1);
        return `${userCode}
class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode() {}
        ListNode(int val) { this.val = val; }
        ListNode(int val, ListNode next) { this.val = val; this.next = next; }
    }
    
    static ListNode arrayToList(int[] arr) {
        if (arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for (int i = 1; i < arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }
    
    static String listToString(ListNode head) {
        StringBuilder sb = new StringBuilder("[");
        while (head != null) {
            sb.append(head.val);
            if (head.next != null) sb.append(",");
            head = head.next;
        }
        sb.append("]");
        return sb.toString();
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] arr = {${nums206}};
        ListNode head = arrayToList(arr);
        System.out.println(listToString(sol.reverseList(head)));
    }
}`;

      case 15: // 3Sum
        const nums15 = input.slice(1, -1);
        return `${userCode}
import java.util.*;
class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int[] nums = {${nums15}};
        List<List<Integer>> result = sol.threeSum(nums);
        System.out.println(result);
    }
}`;

      default:
        return userCode;
    }
  };

  const wrapCpp = (
    userCode: string,
    input: string,
    problemId: number
  ): string => {
    const lines = input.split("\n");

    switch (problemId) {
      case 1: // Two Sum
        const nums1 = lines[0].slice(1, -1);
        return `#include <iostream>
#include <vector>
using namespace std;

${userCode}

int main() {
    Solution solution;
    vector<int> nums = {${nums1}};
    int target = ${lines[1]};
    vector<int> result = solution.twoSum(nums, target);
    cout << "[" << result[0] << "," << result[1] << "]" << endl;
    return 0;
}`;

      case 9: // Palindrome Number
        return `#include <iostream>
using namespace std;

${userCode}

int main() {
    Solution solution;
    cout << (solution.isPalindrome(${input}) ? "true" : "false") << endl;
    return 0;
}`;

      case 20: // Valid Parentheses
        return `#include <iostream>
#include <string>
using namespace std;

${userCode}

int main() {
    Solution solution;
    string s = ${input};
    cout << (solution.isValid(s) ? "true" : "false") << endl;
    return 0;
}`;

      case 21: // Merge Two Sorted Lists
        const list1Cpp = lines[0].slice(1, -1);
        const list2Cpp = lines[1].slice(1, -1);
        return `#include <iostream>
#include <vector>
using namespace std;

${userCode}

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

ListNode* arrayToList(vector<int> arr) {
    if (arr.empty()) return nullptr;
    ListNode* head = new ListNode(arr[0]);
    ListNode* curr = head;
    for (int i = 1; i < arr.size(); i++) {
        curr->next = new ListNode(arr[i]);
        curr = curr->next;
    }
    return head;
}

void printList(ListNode* head) {
    cout << "[";
    while (head) {
        cout << head->val;
        if (head->next) cout << ",";
        head = head->next;
    }
    cout << "]" << endl;
}

int main() {
    Solution solution;
    vector<int> arr1 = {${list1Cpp}};
    vector<int> arr2 = {${list2Cpp}};
    ListNode* list1 = arrayToList(arr1);
    ListNode* list2 = arrayToList(arr2);
    printList(solution.mergeTwoLists(list1, list2));
    return 0;
}`;

      case 53: // Maximum Subarray
        const nums53 = input.slice(1, -1);
        return `#include <iostream>
#include <vector>
using namespace std;

${userCode}

int main() {
    Solution solution;
    vector<int> nums = {${nums53}};
    cout << solution.maxSubArray(nums) << endl;
    return 0;
}`;

      case 121: // Best Time to Buy and Sell Stock
        const prices121 = input.slice(1, -1);
        return `#include <iostream>
#include <vector>
using namespace std;

${userCode}

int main() {
    Solution solution;
    vector<int> prices = {${prices121}};
    cout << solution.maxProfit(prices) << endl;
    return 0;
}`;

      case 206: // Reverse Linked List
        const nums206 = input.slice(1, -1);
        return `#include <iostream>
#include <vector>
using namespace std;

${userCode}

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

ListNode* arrayToList(vector<int> arr) {
    if (arr.empty()) return nullptr;
    ListNode* head = new ListNode(arr[0]);
    ListNode* curr = head;
    for (int i = 1; i < arr.size(); i++) {
        curr->next = new ListNode(arr[i]);
        curr = curr->next;
    }
    return head;
}

void printList(ListNode* head) {
    cout << "[";
    while (head) {
        cout << head->val;
        if (head->next) cout << ",";
        head = head->next;
    }
    cout << "]" << endl;
}

int main() {
    Solution solution;
    vector<int> arr = {${nums206}};
    ListNode* head = arrayToList(arr);
    printList(solution.reverseList(head));
    return 0;
}`;

      case 15: // 3Sum
        const nums15 = input.slice(1, -1);
        return `#include <iostream>
#include <vector>
using namespace std;

${userCode}

int main() {
    Solution solution;
    vector<int> nums = {${nums15}};
    vector<vector<int>> result = solution.threeSum(nums);
    cout << "[";
    for (int i = 0; i < result.size(); i++) {
        cout << "[";
        for (int j = 0; j < result[i].size(); j++) {
            cout << result[i][j];
            if (j < result[i].size() - 1) cout << ",";
        }
        cout << "]";
        if (i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    return 0;
}`;

      default:
        return userCode;
    }
  };

  const runCode = async (): Promise<void> => {
    setIsRunning(true);
    setActiveTab("result");
    const startTime = Date.now();

    try {
      const firstTestCase = testCases[0];
      if (!firstTestCase) {
        setOutput("❌ No test cases available");
        return;
      }

      const wrappedCode = wrapCodeForExecution(code, firstTestCase);

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: wrappedCode,
          language,
          input: firstTestCase.input,
        }),
      });

      const data: APIResponse<ExecutionResult> = await response.json();
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (!data.success) {
        setOutput(`❌ Error: ${data.error?.message}`);
        return;
      }

      const result = data.data!;

      if (result.statusId === 3) {
        setOutput(
          `✅ Code executed successfully!\n\nOutput: ${result.stdout || "No output"}\nExpected: ${firstTestCase.expectedOutput}\nTime: ${result.time || "N/A"}ms\nMemory: ${result.memory || "N/A"}KB`
        );
      } else if (result.statusId === 6) {
        setOutput(
          `❌ Compilation Error\n\n${result.compile_output || result.stderr || "Unknown error"}`
        );
      } else {
        setOutput(
          `❌ ${result.status}\n\n${result.stderr || result.compile_output || "Runtime error"}`
        );
      }
    } catch (error) {
      console.error("❌ Run error:", error);
      setOutput(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async (): Promise<void> => {
    setIsRunning(true);
    setActiveTab("result");
    setTestResults([]);
    const startTime = Date.now();

    try {
      // WRAP each test case
      const wrappedCodes = testCases.map((tc) =>
        wrapCodeForExecution(code, tc)
      );

      const submitResponse = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codes: wrappedCodes,
          language,
          testCases,
        }),
      });

      const submitData: APIResponse<{
        submissionIds: string[];
        totalTestCases: number;
      }> = await submitResponse.json();

      if (!submitData.success) {
        setOutput(`❌ Error: ${submitData.error?.message}`);
        setIsRunning(false);
        return;
      }

      const submissionIds = submitData.data!.submissionIds;
      console.log(`📤 Submitted ${submissionIds.length} test cases`);

      let allDone = false;
      let attempts = 0;
      const maxAttempts = 30;
      let finalResults: Array<{
        token: string;
        status: string;
        isPending: boolean;
        actualOutput: string | null;
        passed: boolean;
        time: string | null;
        memory: number | null;
        error: string | null;
        expectedOutput: string;
      }> = [];

      while (!allDone && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const statusResponse = await fetch("/api/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokens: submissionIds,
            expectedOutputs: testCases.map((tc) => tc.expectedOutput),
          }),
        });

        const statusData: APIResponse<{
          results: Array<{
            token: string;
            status: string;
            isPending: boolean;
            actualOutput: string | null;
            passed: boolean;
            time: string | null;
            memory: number | null;
            error: string | null;
            expectedOutput: string;
          }>;
        }> = await statusResponse.json();

        if (statusData.success) {
          finalResults = statusData.data!.results;
          allDone = finalResults.every((r) => !r.isPending);

          const currentResults: TestResult[] = finalResults.map((result) => ({
            input: "",
            expectedOutput: result.expectedOutput,
            actualOutput: result.actualOutput,
            passed: result.passed,
            status: result.status,
            time: result.time,
            memory: result.memory,
            error: result.error,
          }));
          setTestResults(currentResults);
        }

        attempts++;
      }

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      const passedTests = finalResults.filter((r) => r.passed).length;
      const totalTests = finalResults.length;

      if (passedTests === totalTests) {
        const avgTime =
          finalResults.reduce(
            (sum, r) => sum + (parseFloat(r.time || "0") || 0),
            0
          ) / totalTests;

        setOutput(
          `🎉 Accepted!\n\nAll ${totalTests} test cases passed!\nAvg Runtime: ${avgTime.toFixed(2)}ms\nTotal Time: ${executionTime}ms`
        );
      } else {
        const failedTestIndex = finalResults.findIndex((r) => !r.passed);
        const failedTest = finalResults[failedTestIndex];
        const failedTestCase = testCases[failedTestIndex];

        setOutput(
          `❌ Wrong Answer\n\nPassed: ${passedTests}/${totalTests} test cases\n\n━━━━━━━━━━━━━━━━━━━━━\nTest Case #${failedTestIndex + 1} Failed\n━━━━━━━━━━━━━━━━━━━━━\n\nInput: ${failedTestCase?.input.replace(/\n/g, " ")}\nExpected Output: ${failedTest?.expectedOutput}\nYour Output: ${failedTest?.actualOutput?.trim() || "No output"}\n\nStatus: ${failedTest?.status}\nTime: ${failedTest?.time}ms\nMemory: ${failedTest?.memory}KB\n${failedTest?.error ? `Error: ${failedTest.error}` : ""}`
        );
      }
    } catch (error) {
      console.error("❌ Submit error:", error);
      setOutput(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const toggleFullscreen = (): void => {
    onFullscreenToggle?.(!isFullscreen);
  };

  const getStatusIcon = (
    passed: boolean,
    error: string | null
  ): React.ReactNode => {
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-background border border-border px-3 py-2 rounded-md text-sm font-medium focus:ring-2 focus:ring-primary"
          >
            {LANGUAGES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>

          {showSettings && (
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-background border border-border px-2 py-1 rounded text-sm w-20"
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setTheme(theme === "vs-dark" ? "vs-light" : "vs-dark")
            }
          >
            {theme === "vs-dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          <Button variant="outline" size="sm" onClick={copyCode}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>

          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          options={{
            fontSize,
            minimap: { enabled: false },
            formatOnType: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            wordWrap: "on",
            bracketPairColorization: { enabled: true },
          }}
        />

        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1">
          <FileText size={12} />
          <span>{code.split("\n").length} lines</span>
        </div>
      </div>

      <div className="p-4 border-t bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={runCode} disabled={isRunning} variant="outline">
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Running...
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                Run
              </>
            )}
          </Button>

          <Button
            onClick={submitCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {testResults.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {testResults.filter((tr) => tr.passed).length}/
              {testResults.length} passed
            </span>
          )}

          {executionTime && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Zap size={12} />
              {executionTime}ms
            </span>
          )}
        </div>
      </div>

      <div className="border-t flex flex-col h-64">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <TabsList className="flex-shrink-0 w-full rounded-none">
            <TabsTrigger value="testcase">Testcases</TabsTrigger>
            <TabsTrigger value="result">
              Results
              {testResults.length > 0 && (
                <span className="ml-2 text-xs">
                  ({testResults.filter((tr) => tr.passed).length}/
                  {testResults.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="testcase"
            className="flex-1 p-4 m-0 overflow-y-auto"
          >
            <Tabs defaultValue="0" className="h-full flex flex-col">
              <TabsList
                className="grid w-full flex-shrink-0"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(testCases.length, 3)}, 1fr)`,
                }}
              >
                {testCases.map((_, index) => (
                  <TabsTrigger key={index} value={index.toString()}>
                    Case {index + 1}
                    {testResults[index] && (
                      <span className="ml-1">
                        {getStatusIcon(
                          testResults[index].passed,
                          testResults[index].error
                        )}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-y-auto" ref={testContentRef}>
                {testCases.map((tc, index) => (
                  <TabsContent
                    key={index}
                    value={index.toString()}
                    className="space-y-3 m-0 p-4"
                  >
                    <div className="space-y-3 font-mono text-sm">
                      <div>
                        <span className="text-foreground font-semibold">
                          Input:
                        </span>
                        <div className="bg-muted/50 p-2 rounded mt-1 text-muted-foreground">
                          {tc.input.split("\n").join(" ")}
                        </div>
                      </div>

                      <div>
                        <span className="text-foreground font-semibold">
                          Expected Output:
                        </span>
                        <div className="bg-green-500/10 p-2 rounded mt-1 text-green-600 dark:text-green-400">
                          {tc.expectedOutput}
                        </div>
                      </div>

                      {testResults[index] && (
                        <div>
                          <span className="text-foreground font-semibold">
                            Your Output:
                          </span>
                          <div
                            className={`p-2 rounded mt-1 ${
                              testResults[index].passed
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {testResults[index].actualOutput?.trim() ||
                              "No output"}
                          </div>
                        </div>
                      )}

                      {testResults[index] && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-muted-foreground">
                            <div>⏱️ Time: {testResults[index].time}ms</div>
                            <div>💾 Memory: {testResults[index].memory}KB</div>
                            <div>
                              {testResults[index].passed ? (
                                <span className="text-green-600 dark:text-green-400">
                                  ✅ Accepted
                                </span>
                              ) : (
                                <span className="text-red-600 dark:text-red-400">
                                  ❌ {testResults[index].status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </TabsContent>

          <TabsContent
            value="result"
            className="flex-1 p-4 m-0 overflow-y-auto"
          >
            {output || isRunning ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal size={16} />
                  <span className="font-medium">Output</span>
                </div>

                <div className="p-3 rounded-lg border bg-muted/50 font-mono text-sm">
                  {isRunning ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Executing...</span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  )}
                </div>

                {testResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Details</h4>
                    {testResults.map((result, idx) => (
                      <div key={idx} className="p-2 border rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">Test {idx + 1}</span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.passed, result.error)}
                            {result.time && <span>{result.time}ms</span>}
                          </div>
                        </div>
                        {result.error && (
                          <p className="text-red-500">Error: {result.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Terminal className="mx-auto h-8 w-8 mb-2" />
                  <p>Run code to see results</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
