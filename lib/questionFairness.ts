import crypto from "crypto";

export function hashStudentId(studentId: string): number {
  const hash = crypto.createHash("sha256").update(studentId).digest("hex");
  return parseInt(hash.substring(0, 8), 16);
}

export async function assignFairQuestions(
  assessment: any,
  studentId: string,
  questions: any[],
): Promise<any[]> {
  if (
    !assessment.questionVariants ||
    assessment.questionVariants.length === 0
  ) {
    return questions;
  }

  const studentHash = hashStudentId(studentId);
  const assignedQuestions = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const concept = question.topic || `concept_${i}`;

    // Find variants for this concept
    const conceptVariants = assessment.questionVariants.filter(
      (v: any) => v.conceptId === concept || v.topicArea === concept,
    );

    if (conceptVariants.length > 0) {
      // Deterministic variant selection
      const variantIndex = (studentHash + i * 31) % conceptVariants.length;
      const selectedVariant = conceptVariants[variantIndex];

      // Apply variant parameters to question
      const variantQuestion = {
        ...question,
        variantId: selectedVariant.variantId,
        // Merge variant parameters into question
        ...applyVariantParameters(question, selectedVariant.parameters),
      };

      assignedQuestions.push(variantQuestion);
    } else {
      assignedQuestions.push(question);
    }
  }

  return assignedQuestions;
}

function applyVariantParameters(
  question: any,
  parameters: Record<string, any>,
): any {
  // Replace parameter placeholders in question text
  let modifiedText = question.questionText;

  for (const [key, value] of Object.entries(parameters)) {
    modifiedText = modifiedText.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      String(value),
    );
  }

  // Update equation if parameters affect it
  if (question.equationContent && parameters) {
    let modifiedLatex = question.equationContent.latex;
    for (const [key, value] of Object.entries(parameters)) {
      modifiedLatex = modifiedLatex.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, "g"),
        String(value),
      );
    }

    return {
      questionText: modifiedText,
      equationContent: {
        ...question.equationContent,
        latex: modifiedLatex,
      },
    };
  }

  return { questionText: modifiedText };
}

export function validateFairnessAcrossClass(
  allStudentIds: string[],
  questions: any[],
): {
  isFair: boolean;
  difficultyVariance: number;
  averageDifficultyByStudent: Record<string, number>;
  warnings: string[];
} {
  const difficulties: number[] = [];
  const averageDifficultyByStudent: Record<string, number> = {};

  for (const studentId of allStudentIds) {
    const studentHash = hashStudentId(studentId);
    let totalDifficulty = 0;

    for (let i = 0; i < questions.length; i++) {
      // Simulate difficulty based on variant (simplified)
      const variantIndex = (studentHash + i * 31) % 5;
      const difficulty = 0.5 + variantIndex * 0.1; // 0.5 to 0.9
      totalDifficulty += difficulty;
    }

    const avgDifficulty = totalDifficulty / questions.length;
    averageDifficultyByStudent[studentId] = avgDifficulty;
    difficulties.push(avgDifficulty);
  }

  // Calculate variance
  const mean = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
  const variance =
    difficulties.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    difficulties.length;
  const stdDev = Math.sqrt(variance);

  const isFair = stdDev < 0.1;
  const warnings: string[] = [];

  if (!isFair) {
    warnings.push(
      `Difficulty variance (${stdDev.toFixed(3)}) exceeds threshold of 0.1`,
    );
  }

  return {
    isFair,
    difficultyVariance: stdDev,
    averageDifficultyByStudent,
    warnings,
  };
}
