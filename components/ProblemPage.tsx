"use client";
import React, { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  ThumbsDown,
  Star,
  Share,
  BookOpen,
  Users,
  Trophy,
  GripVertical,
} from "lucide-react";
import CodeEditor from "@/components/CodeEditor";

const PROBLEM_DATA = {
  id: 1,
  title: "Two Sum",
  difficulty: "Easy",
  acceptance: "56.2%",
  likes: 63900,
  dislikes: 1500,
  tags: ["Array", "Hash Table"],
  companies: ["Amazon", "Apple", "Microsoft", "Google", "Facebook"],
  description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.

You may assume that each input would have <strong><em>exactly one solution</em></strong>, and you may not use the <em>same</em> element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: `nums = [2,7,11,15], target = 9`,
      output: `[0,1]`,
      explanation: `Because nums[0] + nums[1] == 9, we return [0, 1].`,
    },
    {
      input: `nums = [3,2,4], target = 6`,
      output: `[1,2]`,
      explanation: `Because nums[1] + nums[2] == 6, we return [1, 2].`,
    },
    {
      input: `nums = [3,3], target = 6`,
      output: `[0,1]`,
      explanation: `Because nums[0] + nums[1] == 6, we return [0, 1].`,
    },
  ],
  constraints: [
    `2 ≤ nums.length ≤ 10⁴`,
    `-10⁹ ≤ nums[i] ≤ 10⁹`,
    `-10⁹ ≤ target ≤ 10⁹`,
    `Only one valid answer exists.`,
  ],
};

const TEST_CASES = [
  {
    case: "Case 1",
    input: { nums: "[2,7,11,15]", target: "9" },
    expectedOutput: "[0,1]",
  },
  {
    case: "Case 2",
    input: { nums: "[3,2,4]", target: "6" },
    expectedOutput: "[1,2]",
  },
  {
    case: "Case 3",
    input: { nums: "[3,3]", target: "6" },
    expectedOutput: "[0,1]",
  },
];

interface ProblemPageProps {
  problemId?: string;
}

export default function ProblemPage({ problemId }: ProblemPageProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (isFullscreen) {
    return (
      <div className="h-screen">
        <CodeEditor
          testCases={TEST_CASES}
          onFullscreenToggle={setIsFullscreen}
          isFullscreen={isFullscreen}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <PanelGroup direction="horizontal">
        {/* Left Panel - Problem Description */}
        <Panel
          defaultSize={50}
          minSize={25}
          maxSize={80}
          className="border-r border-border"
        >
          <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Problem Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {PROBLEM_DATA.id}. {PROBLEM_DATA.title}
                  </h1>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Badge
                    variant="outline"
                    className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400"
                  >
                    {PROBLEM_DATA.difficulty}
                  </Badge>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users size={16} />
                    <span className="text-sm">
                      {PROBLEM_DATA.acceptance} acceptance
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLiked(!liked)}
                    className={`${liked ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    <ThumbsUp size={16} className="mr-1" />
                    {PROBLEM_DATA.likes}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDisliked(!disliked)}
                    className={`${disliked ? "text-red-600" : "text-muted-foreground"}`}
                  >
                    <ThumbsDown size={16} className="mr-1" />
                    {PROBLEM_DATA.dislikes}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`${bookmarked ? "text-yellow-600" : "text-muted-foreground"}`}
                  >
                    <Star size={16} className="mr-1" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <Share size={16} className="mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Problem Description */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="editorial">Editorial</TabsTrigger>
                  <TabsTrigger value="solutions">Solutions</TabsTrigger>
                  <TabsTrigger value="submissions">Submissions</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-6">
                  {/* Problem Statement */}
                  <div>
                    <div
                      className="text-sm text-foreground prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: PROBLEM_DATA.description,
                      }}
                    />
                  </div>

                  {/* Examples */}
                  <div className="space-y-4">
                    {PROBLEM_DATA.examples.map((example, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <h4 className="font-medium text-foreground mb-2">
                            Example {index + 1}:
                          </h4>
                          <div className="space-y-2 font-mono text-sm">
                            <div>
                              <strong className="text-foreground">
                                Input:{" "}
                              </strong>
                              <span className="text-muted-foreground">
                                {example.input}
                              </span>
                            </div>
                            <div>
                              <strong className="text-foreground">
                                Output:{" "}
                              </strong>
                              <span className="text-muted-foreground">
                                {example.output}
                              </span>
                            </div>
                            <div>
                              <strong className="text-foreground">
                                Explanation:{" "}
                              </strong>
                              <span className="text-muted-foreground">
                                {example.explanation}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div>
                    <h4 className="font-bold text-foreground mb-3">
                      Constraints:
                    </h4>
                    <ul className="space-y-1">
                      {PROBLEM_DATA.constraints.map((constraint, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground font-mono"
                        >
                          • {constraint}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags & Companies */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">
                        Related Topics:
                      </h4>
                      <div className="flex gap-2">
                        {PROBLEM_DATA.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-foreground mb-2">
                        Companies:
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {PROBLEM_DATA.companies.slice(0, 3).map((company) => (
                          <Badge
                            key={company}
                            variant="outline"
                            className="text-xs"
                          >
                            {company}
                          </Badge>
                        ))}
                        {PROBLEM_DATA.companies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{PROBLEM_DATA.companies.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="editorial">
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Editorial content coming soon...
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="solutions">
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Community solutions coming soon...
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="submissions">
                  <div className="text-center py-12">
                    <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Your submissions will appear here...
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Panel>

        {/* Resize Handle - The Gap with Grid Icon */}
        <PanelResizeHandle className="w-2 bg-muted/50 hover:bg-primary/20 transition-colors duration-200 flex items-center justify-center border-x border-border group">
          <GripVertical
            size={16}
            className="text-muted-foreground group-hover:text-primary transition-colors"
          />
        </PanelResizeHandle>

        {/* Right Panel - Code Editor */}
        <Panel minSize={30}>
          <CodeEditor
            testCases={TEST_CASES}
            onFullscreenToggle={setIsFullscreen}
            isFullscreen={isFullscreen}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
