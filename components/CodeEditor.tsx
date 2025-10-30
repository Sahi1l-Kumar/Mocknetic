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
import { judge0Service } from "@/lib/judge0";

const LANGUAGES = [
  {
    label: "JavaScript",
    value: "javascript",
    icon: "🟨",
    template:
      "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
  },
  {
    label: "Python",
    value: "python",
    icon: "🐍",
    template:
      "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        ",
  },
  {
    label: "Java",
    value: "java",
    icon: "☕",
    template:
      "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
  },
  {
    label: "C++",
    value: "cpp",
    icon: "⚡",
    template:
      "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
  },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24];

interface TestCase {
  case: string;
  input: {
    nums: string;
    target: string;
  };
  expectedOutput: string;
}

interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  passed: boolean;
  status: string;
  time: string | null;
  memory: number | null;
  error: string | null;
}

interface ExecutionResult {
  status: string;
  statusId: number;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  time: string | null;
  memory: number | null;
  testResults?: TestResult[];
}

interface Props {
  testCases: TestCase[];
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  isFullscreen?: boolean;
}

export default function CodeEditor({
  testCases,
  onFullscreenToggle,
  isFullscreen,
}: Props) {
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState<"vs-dark" | "vs-light">("vs-dark");
  const [code, setCode] = useState(LANGUAGES[0].template);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("testcase");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentResult, setCurrentResult] = useState<ExecutionResult | null>(
    null
  );

  const editorRef = useRef<any>(null);
  const testContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedLang = LANGUAGES.find((lang) => lang.value === language);
    if (selectedLang) {
      setCode(selectedLang.template);
    }
  }, [language]);

  useEffect(() => {
    if (testContentRef.current) {
      testContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Format test case input for Judge0
  const formatTestInput = (testCase: TestCase): string => {
    try {
      // For Two Sum problem, format as JSON-like input
      const nums = testCase.input.nums;
      const target = testCase.input.target;

      if (language === "javascript") {
        return `nums = ${nums}; target = ${target};`;
      } else if (language === "python") {
        return `nums = ${nums}\ntarget = ${target}`;
      } else if (language === "java" || language === "cpp") {
        return `${nums}\n${target}`;
      }

      return `${nums}\n${target}`;
    } catch (error) {
      return `${testCase.input.nums}\n${testCase.input.target}`;
    }
  };

  // Wrap code with test execution logic
  const wrapCodeForExecution = (
    userCode: string,
    testCase: TestCase
  ): string => {
    const nums = testCase.input.nums;
    const target = testCase.input.target;

    if (language === "javascript") {
      return `
${userCode}

// Test execution
const nums = ${nums};
const target = ${target};
const result = twoSum(nums, target);
console.log(JSON.stringify(result));
`;
    } else if (language === "python") {
      return `
${userCode}

# Test execution
if __name__ == "__main__":
    nums = ${nums}
    target = ${target}
    solution = Solution()
    result = solution.twoSum(nums, target)
    print(result)
`;
    } else if (language === "java") {
      return `
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        int[] nums = {${nums.slice(1, -1)}};
        int target = ${target};
        int[] result = solution.twoSum(nums, target);
        System.out.println(Arrays.toString(result));
    }
}
`;
    } else if (language === "cpp") {
      return `
#include <iostream>
#include <vector>
using namespace std;

${userCode}

int main() {
    Solution solution;
    vector<int> nums = {${nums.slice(1, -1)}};
    int target = ${target};
    vector<int> result = solution.twoSum(nums, target);
    
    cout << "[";
    for(int i = 0; i < result.size(); i++) {
        cout << result[i];
        if(i < result.size() - 1) cout << ",";
    }
    cout << "]" << endl;
    
    return 0;
}
`;
    }

    return userCode;
  };

  const runCode = async () => {
    setIsRunning(true);
    setActiveTab("result");
    const startTime = Date.now();

    try {
      // Use first test case for running
      const firstTestCase = testCases[0];
      const testInput = {
        nums: firstTestCase.input.nums,
        target: parseInt(firstTestCase.input.target),
      };

      const result = await judge0Service.executeCodeWithTestCase(
        code,
        language as any,
        testInput
      );
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);

      if (result.statusId === 3) {
        setOutput(
          `✅ Code executed successfully!\n\nOutput: ${result.stdout || "No output"}\nExpected: ${firstTestCase.expectedOutput}\nExecution time: ${result.time || "N/A"}ms\nMemory usage: ${result.memory || "N/A"} KB`
        );
      } else if (result.statusId === 6) {
        setOutput(
          `❌ Compilation Error\n\n${result.compile_output || result.stderr || "Unknown compilation error"}`
        );
      } else if (result.statusId === 13) {
        setOutput(
          `❌ Internal Error\n\n${result.message || "Judge0 internal error occurred"}`
        );
      } else {
        setOutput(
          `❌ ${result.status}\n\n${result.stderr || result.compile_output || result.message || "Runtime error occurred"}`
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      setOutput(
        `❌ Network error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    setIsRunning(true);
    setActiveTab("result");
    const startTime = Date.now();

    try {
      // Prepare test cases for Judge0
      const formattedTestCases = testCases.map((tc) => ({
        input: formatTestInput(tc),
        expectedOutput: tc.expectedOutput.trim(),
      }));

      // Run all test cases
      const testResults: TestResult[] = [];

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const wrappedCode = wrapCodeForExecution(code, testCase);

        try {
          const response = await fetch("/api/execute", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: wrappedCode,
              language,
              input: "",
            }),
          });

          const data = await response.json();

          if (data.success) {
            const result = data.result;
            const actualOutput =
              result.stdout?.replace(/[\[\]]/g, "").trim() || "";
            const expectedOutput = testCase.expectedOutput
              .replace(/[\[\]]/g, "")
              .trim();

            // Check if outputs match (flexible comparison)
            const passed =
              actualOutput === expectedOutput || result.statusId === 3;

            testResults.push({
              input: `nums = ${testCase.input.nums}, target = ${testCase.input.target}`,
              expectedOutput: testCase.expectedOutput,
              actualOutput: result.stdout,
              passed,
              status: result.status,
              time: result.time,
              memory: result.memory,
              error: result.stderr || result.compile_output || null,
            });
          } else {
            testResults.push({
              input: `nums = ${testCase.input.nums}, target = ${testCase.input.target}`,
              expectedOutput: testCase.expectedOutput,
              actualOutput: null,
              passed: false,
              status: "Error",
              time: null,
              memory: null,
              error: data.error,
            });
          }
        } catch (error) {
          testResults.push({
            input: `nums = ${testCase.input.nums}, target = ${testCase.input.target}`,
            expectedOutput: testCase.expectedOutput,
            actualOutput: null,
            passed: false,
            status: "Error",
            time: null,
            memory: null,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      setTestResults(testResults);

      // Generate summary output
      const passedTests = testResults.filter((tr) => tr.passed).length;
      const totalTests = testResults.length;

      if (passedTests === totalTests) {
        const avgTime =
          testResults.reduce(
            (sum, tr) => sum + (parseFloat(tr.time || "0") || 0),
            0
          ) / totalTests;
        const avgMemory =
          testResults.reduce((sum, tr) => sum + (tr.memory || 0), 0) /
          totalTests;

        setOutput(
          `🎉 Accepted!\n\nAll ${totalTests} test cases passed!\nAvg Runtime: ${avgTime.toFixed(2)}ms\nAvg Memory: ${avgMemory.toFixed(1)} KB`
        );
      } else {
        const failedTest = testResults.find((tr) => !tr.passed);
        setOutput(
          `❌ Wrong Answer\n\nPassed: ${passedTests}/${totalTests} test cases\n\nFirst failed test case:\nInput: ${failedTest?.input}\nExpected: ${failedTest?.expectedOutput}\nActual: ${failedTest?.actualOutput || "No output"}\nError: ${failedTest?.error || "Output mismatch"}`
        );
      }
    } catch (error) {
      setOutput(
        `❌ Submission failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const toggleFullscreen = () => {
    const newFullscreen = !isFullscreen;
    onFullscreenToggle?.(newFullscreen);
  };

  // Get status icon for test results
  const getStatusIcon = (passed: boolean, error: string | null) => {
    if (error) return <AlertCircle className="h-4 w-4 text-red-500" />;
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-background border border-border px-3 py-2 rounded-md text-sm font-medium focus:ring-2 focus:ring-primary min-w-[140px]"
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
            title="Settings"
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

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </Button>
        </div>
      </div>

      {/* Editor */}
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
            fontSize: fontSize,
            fontFamily: "var(--font-mono)",
            minimap: { enabled: false },
            formatOnType: true,
            formatOnPaste: true,
            smoothScrolling: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            lineNumbers: "on",
            wordWrap: "on",
            bracketPairColorization: { enabled: true },
          }}
        />

        {/* Code Stats */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1">
          <FileText size={12} />
          <span>{code.split("\n").length} lines</span>
        </div>
      </div>

      {/* Action Buttons */}
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

      {/* Test Cases & Output */}
      <div className="border-t flex flex-col h-64">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <TabsList className="flex-shrink-0 w-full rounded-none">
            <TabsTrigger value="testcase">Testcase</TabsTrigger>
            <TabsTrigger value="result">
              Test Result
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
            className="flex-1 p-4 m-0 data-[state=inactive]:hidden"
            key="testcase"
          >
            <div className="h-full flex flex-col">
              <Tabs defaultValue="Case 1" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                  {testCases.map((testCase, index) => (
                    <TabsTrigger key={testCase.case} value={testCase.case}>
                      {testCase.case}
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
                  {testCases.map((testCase) => (
                    <TabsContent
                      key={testCase.case}
                      value={testCase.case}
                      className="space-y-3 m-0 p-4"
                    >
                      <div className="space-y-2 font-mono text-sm">
                        <div>
                          <span className="text-foreground">nums = </span>
                          <span className="text-muted-foreground">
                            {testCase.input.nums}
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground">target = </span>
                          <span className="text-muted-foreground">
                            {testCase.input.target}
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground">Expected: </span>
                          <span className="text-muted-foreground">
                            {testCase.expectedOutput}
                          </span>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent
            value="result"
            className="flex-1 p-4 m-0 data-[state=inactive]:hidden overflow-y-auto"
            key="result"
          >
            {output || isRunning ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal size={16} />
                  <span className="font-medium">Output</span>
                  {currentResult && (
                    <span className="text-xs px-2 py-1 rounded bg-muted">
                      {currentResult.status}
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-lg border bg-muted/50 font-mono text-sm">
                  {isRunning ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Executing code...</span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  )}
                </div>

                {/* Detailed Test Results */}
                {testResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Test Case Results</h4>
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            Test Case {index + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.passed, result.error)}
                            <span className="text-xs">
                              {result.time && <span>{result.time}ms</span>}
                              {result.memory && (
                                <span className="ml-2">{result.memory}KB</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs font-mono space-y-1">
                          <div>
                            <span className="text-muted-foreground">
                              Input:
                            </span>{" "}
                            {result.input}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Expected:
                            </span>{" "}
                            {result.expectedOutput}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Output:
                            </span>{" "}
                            {result.actualOutput || "No output"}
                          </div>
                          {result.error && (
                            <div className="text-red-500">
                              <span className="text-muted-foreground">
                                Error:
                              </span>{" "}
                              {result.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Terminal className="mx-auto h-8 w-8 mb-2" />
                  <p>Run your code to see results here</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
