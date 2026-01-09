"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";

interface InterviewFormProps {
  onSubmit: (sessionId: string) => void;
}

export default function InterviewForm({ onSubmit }: InterviewFormProps) {
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobDescription: "",
    companyName: "",
    companyDescription: "",
    resume: null as File | null,
    parsedResume: "",
    maxQuestions: 5,
  });
  const [loading, setLoading] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionCountChange = (value: number) => {
    setFormData((prev) => ({ ...prev, maxQuestions: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    setFormData((prev) => ({ ...prev, resume: file }));

    if (file) {
      parseResume(file);
    }
  };

  const parseResume = async (file: File) => {
    setParsingResume(true);
    try {
      const formDataForParsing = new FormData();
      formDataForParsing.append("FILE", file);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formDataForParsing,
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const parsedText = await response.text();
      setFormData((prev) => ({ ...prev, parsedResume: parsedText }));
      toast.success("Resume parsed successfully!");
    } catch (error) {
      console.error("Resume parse error:", error);
      toast.error("Failed to parse resume");
    } finally {
      setParsingResume(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.jobTitle || !formData.jobDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_PYTHON_API || "http://localhost:5000";

      const data = new FormData();
      data.append("jobTitle", formData.jobTitle);
      data.append("jobDescription", formData.jobDescription);
      data.append("companyName", formData.companyName);
      data.append("companyDescription", formData.companyDescription);
      data.append("parsedResume", formData.parsedResume);
      data.append("maxQuestions", formData.maxQuestions.toString());

      if (formData.resume) {
        data.append("resume", formData.resume);
      }

      console.log("📤 Submitting interview form...");
      console.log(`🎯 Max Questions: ${formData.maxQuestions}`);

      const response = await fetch(`${API_BASE}/api/interview/create`, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Interview created:", result);

      if (result.success && result.session_id) {
        toast.success(
          `Interview session created with ${formData.maxQuestions} questions!`
        );
        onSubmit(result.session_id);
      } else {
        toast.error("Failed to create interview");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error(
        "Failed to connect to server. Ensure Python backend is running on http://localhost:5000"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-8">
            Interview Preparation
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="Enter job title"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading || parsingResume}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                placeholder="Paste the job description here"
                rows={6}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={loading || parsingResume}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Company Name (Optional)
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || parsingResume}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Company Description (Optional)
              </label>
              <textarea
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleInputChange}
                placeholder="Enter company description"
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || parsingResume}
              />
            </div>

            {/* NEW: Number of Questions Selector */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-4">
                  📝 Number of Interview Questions
                </label>
                <div className="flex items-center gap-6">
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={formData.maxQuestions}
                    onChange={(e) =>
                      handleQuestionCountChange(parseInt(e.target.value))
                    }
                    className="flex-1 h-3 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    disabled={loading || parsingResume}
                  />
                  <div className="bg-white border-2 border-blue-500 rounded-lg px-4 py-2 min-w-16 text-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {formData.maxQuestions}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">questions</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between text-xs text-slate-600">
                  <span>Minimum: 3</span>
                  <span>Maximum: 15</span>
                </div>
              </div>

              <div className="bg-white rounded p-4 border border-blue-100">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">💡 Tip:</span> Start with 5-8
                  questions for a focused practice session. Choose more
                  questions for comprehensive preparation.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-4">
                Note: PDF format required for Resume/CV.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Resume / CV (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                    disabled={loading || parsingResume}
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${
                      loading || parsingResume
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="text-center">
                      <FileText className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-sm text-slate-600">
                        {parsingResume
                          ? "Parsing resume..."
                          : formData.resume
                            ? formData.resume.name
                            : "Upload Resume / CV (PDF)"}
                      </span>
                    </div>
                  </label>
                </div>
                {formData.parsedResume && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-medium text-green-700">
                      ✓ Resume parsed and ready
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading || parsingResume}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {parsingResume
                  ? "Parsing Resume..."
                  : loading
                    ? "Creating Interview..."
                    : "Continue to Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
