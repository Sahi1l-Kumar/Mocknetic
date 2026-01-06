"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
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
import { PROBLEM_DATA } from "@/constants";
import type { ProblemData } from "@/types/global";

export default function ProblemPage(): React.ReactNode {
  const params = useParams();
  const id = params.id as string;

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get problem data from constants
  const problem: ProblemData | undefined =
    PROBLEM_DATA[parseInt(id) as keyof typeof PROBLEM_DATA];

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Problem Not Found
          </h2>
          <p className="text-muted-foreground">
            The problem you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  // Convert testCases to the format expected by CodeEditor
  const testCases = problem.testCases.map((tc, idx) => ({
    case: `Case ${idx + 1}`,
    input: tc.input,
    expectedOutput: tc.expectedOutput,
  }));

  if (isFullscreen) {
    return (
      <div className="h-screen">
        <CodeEditor
          testCases={testCases}
          problemId={problem.id}
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
          <div className="h-full overflow-y-scroll">
            <div className="p-6 space-y-6">
              {/* Problem Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {problem.id}. {problem.title}
                  </h1>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <Badge
                    variant="outline"
                    className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400"
                  >
                    Easy
                  </Badge>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users size={16} />
                    <span className="text-sm">50%+ acceptance</span>
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
                    {liked ? "Liked" : "Like"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDisliked(!disliked)}
                    className={`${disliked ? "text-red-600" : "text-muted-foreground"}`}
                  >
                    <ThumbsDown size={16} className="mr-1" />
                    {disliked ? "Disliked" : "Dislike"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`${bookmarked ? "text-yellow-600" : "text-muted-foreground"}`}
                  >
                    <Star
                      size={16}
                      className="mr-1"
                      fill={bookmarked ? "currentColor" : "none"}
                    />
                    {bookmarked ? "Bookmarked" : "Bookmark"}
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
                        __html: problem.description,
                      }}
                    />
                  </div>

                  {/* Examples */}
                  <div className="space-y-4">
                    {problem.examples.map((example, index) => (
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
                      {problem.constraints.map((constraint, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground font-mono"
                        >
                          • {constraint}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">
                        Related Topics:
                      </h4>
                      <div className="flex gap-2">
                        {problem.templates &&
                          Object.keys(problem.templates).map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag.charAt(0).toUpperCase() + tag.slice(1)}
                            </Badge>
                          ))}
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
        <Panel minSize={30} defaultSize={50}>
          <CodeEditor
            testCases={testCases}
            problemId={problem.id}
            onFullscreenToggle={setIsFullscreen}
            isFullscreen={isFullscreen}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}
