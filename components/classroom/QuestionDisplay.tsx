"use client";

import React from "react";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface QuestionDisplayProps {
  question: {
    questionNumber: number;
    questionText: string;
    questionType: "mcq" | "numerical";
    options?: string[];
    points: number;
    equationContent?: {
      latex: string;
      description: string;
      position: "inline" | "display";
    };
    topic?: string;
    bloomsLevel?: number;
  };
  onAnswer: (answer: string | number) => void;
  submitted?: boolean;
  studentAnswer?: string | number;
  showCorrectAnswer?: boolean;
  correctAnswer?: string | number;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  onAnswer,
  submitted,
  studentAnswer,
  showCorrectAnswer,
  correctAnswer,
}) => {
  const renderQuestionText = (text: string) => {
    const parts = text.split(/(\\{\\{[^}]+\\}\\}|\\$\\$[^$]+\\$\\$)/);

    return parts.map((part, idx) => {
      if (part.startsWith("{{") && part.endsWith("}}")) {
        const latex = part.slice(2, -2);
        return (
          <InlineMath
            key={idx}
            math={latex}
            renderError={(err) => (
              <span className="text-red-500">LaTeX Error</span>
            )}
          >
            {latex}
          </InlineMath>
        );
      } else if (part.startsWith("$$") && part.endsWith("$$")) {
        const latex = part.slice(2, -2);
        return (
          <div key={idx} className="my-2">
            <BlockMath
              math={latex}
              renderError={(err) => (
                <span className="text-red-500">LaTeX Error</span>
              )}
            >
              {latex}
            </BlockMath>
          </div>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const getCognitiveLevelLabel = (level?: number) => {
    const labels = [
      "",
      "Remember",
      "Understand",
      "Apply",
      "Analyze",
      "Evaluate",
      "Create",
    ];
    return level ? labels[level] : null;
  };

  return (
    <div className="question-container p-6 bg-white rounded-lg border border-gray-200 shadow-sm mb-4">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Question {question.questionNumber}
              {question.topic && (
                <span className="text-sm text-gray-500 font-normal ml-2">
                  • {question.topic}
                </span>
              )}
            </h3>
            {question.bloomsLevel && (
              <span className="text-xs text-blue-600 font-medium">
                {getCognitiveLevelLabel(question.bloomsLevel)} Level
              </span>
            )}
          </div>
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            {question.points} {question.points === 1 ? "pt" : "pts"}
          </span>
        </div>

        <div className="text-gray-800 mb-4 text-base leading-relaxed">
          {renderQuestionText(question.questionText)}
        </div>

        {question.equationContent && (
          <div className="my-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {question.equationContent.position === "display" ? (
              <div className="text-center">
                <BlockMath
                  math={question.equationContent.latex}
                  renderError={(err) => (
                    <span className="text-red-500">
                      Error rendering equation
                    </span>
                  )}
                >
                  {question.equationContent.latex}
                </BlockMath>
              </div>
            ) : (
              <div>
                <InlineMath
                  math={question.equationContent.latex}
                  renderError={(err) => (
                    <span className="text-red-500">
                      Error rendering equation
                    </span>
                  )}
                >
                  {question.equationContent.latex}
                </InlineMath>
              </div>
            )}
            <p className="text-xs text-gray-600 mt-2 text-center">
              {question.equationContent.description}
            </p>
          </div>
        )}
      </div>

      {question.questionType === "mcq" && question.options && (
        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected =
              studentAnswer === String(idx + 1) || studentAnswer === option;
            const isCorrect =
              showCorrectAnswer &&
              (correctAnswer === String(idx + 1) || correctAnswer === option);

            return (
              <label
                key={idx}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? isCorrect
                      ? "bg-green-50 border-green-500"
                      : showCorrectAnswer
                        ? "bg-red-50 border-red-500"
                        : "bg-blue-50 border-blue-500"
                    : isCorrect && showCorrectAnswer
                      ? "bg-green-50 border-green-500"
                      : "hover:bg-gray-50 border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.questionNumber}`}
                  value={option}
                  onChange={(e) => onAnswer(e.target.value)}
                  checked={isSelected}
                  disabled={submitted}
                  className="mr-3 h-4 w-4"
                />
                <span className="text-gray-800 flex-1">{option}</span>
                {showCorrectAnswer && isCorrect && (
                  <span className="text-green-600 text-sm font-medium ml-2">
                    ✓ Correct
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}

      {question.questionType === "numerical" && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer:
          </label>
          <input
            type="number"
            step="any"
            placeholder="Enter numerical answer (e.g., 1.414, 42, 3.5e-2)"
            value={studentAnswer || ""}
            onChange={(e) => onAnswer(e.target.value)}
            disabled={submitted}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
              showCorrectAnswer
                ? studentAnswer === correctAnswer
                  ? "border-green-500 focus:ring-green-500 bg-green-50"
                  : "border-red-500 focus:ring-red-500 bg-red-50"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          <p className="text-xs text-gray-500 mt-2">
            You can enter decimals (1.414), fractions (0.333), or scientific
            notation (1.5e-3)
          </p>
          {showCorrectAnswer && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-900">
                Correct Answer: {correctAnswer}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
