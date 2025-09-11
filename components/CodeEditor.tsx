"use client";
import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Sun,
  Moon,
  Play,
  Square,
  Download,
  Upload,
  Settings,
  Copy,
  Check,
  Terminal,
  FileText,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface Props {
  testCases: TestCase[];
}

export default function CodeEditor({ testCases }: Props) {
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState<"vs-dark" | "vs-light">("vs-dark");
  const [code, setCode] = useState(LANGUAGES[0].template);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const selectedLang = LANGUAGES.find((lang) => lang.value === language);
    if (selectedLang) {
      setCode(selectedLang.template);
    }
  }, [language]);

  const runCode = async () => {
    setIsRunning(true);
    const startTime = Date.now();

    // Simulate test case execution
    setTimeout(() => {
      const endTime = Date.now();
      setOutput(
        "✅ All test cases passed!\n\nTest Case 1: ✅ Passed\nTest Case 2: ✅ Passed\nTest Case 3: ✅ Passed"
      );
      setExecutionTime(endTime - startTime);
      setIsRunning(false);
    }, 1200);
  };

  const submitCode = async () => {
    setIsRunning(true);
    const startTime = Date.now();

    setTimeout(() => {
      const endTime = Date.now();
      setOutput(
        "🎉 Accepted!\n\nRuntime: 68 ms (Beats 85.23%)\nMemory: 45.1 MB (Beats 67.89%)"
      );
      setExecutionTime(endTime - startTime);
      setIsRunning(false);
    }, 2000);
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
            onClick={() =>
              setTheme(theme === "vs-dark" ? "vs-light" : "vs-dark")
            }
          >
            {theme === "vs-dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={16} />
          </Button>

          <Button variant="outline" size="sm" onClick={copyCode}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
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

        {executionTime && (
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Zap size={12} />
            {executionTime}ms
          </span>
        )}
      </div>

      {/* Test Cases & Output */}
      <div className="border-t max-h-64 overflow-hidden">
        <Tabs defaultValue="testcase" className="h-full">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="testcase">Testcase</TabsTrigger>
            <TabsTrigger value="result">Test Result</TabsTrigger>
          </TabsList>

          <TabsContent
            value="testcase"
            className="p-4 space-y-4 overflow-y-auto max-h-48"
          >
            <Tabs defaultValue="Case 1">
              <TabsList className="grid w-full grid-cols-3">
                {testCases.map((testCase) => (
                  <TabsTrigger key={testCase.case} value={testCase.case}>
                    {testCase.case}
                  </TabsTrigger>
                ))}
              </TabsList>

              {testCases.map((testCase) => (
                <TabsContent
                  key={testCase.case}
                  value={testCase.case}
                  className="space-y-3"
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
            </Tabs>
          </TabsContent>

          <TabsContent value="result" className="p-4 overflow-y-auto max-h-48">
            {(output || isRunning) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Terminal size={16} />
                  <span className="font-medium">Output</span>
                </div>

                <div className="p-3 rounded-lg border bg-muted/50 font-mono text-sm">
                  {isRunning ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span>Running code...</span>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap">{output}</pre>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
