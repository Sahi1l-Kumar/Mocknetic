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
    coverLetter: null as File | null,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "resume" | "coverLetter"
  ) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: file }));
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

      if (formData.resume) {
        data.append("resume", formData.resume);
      }
      if (formData.coverLetter) {
        data.append("coverLetter", formData.coverLetter);
      }

      console.log("📤 Submitting interview form...");

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
        toast.success("Interview session created!");
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-4">
                Note: All documents must be in PDF format.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Resume (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "resume")}
                      className="hidden"
                      id="resume-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="resume-upload"
                      className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="text-center">
                        <FileText className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600">
                          {formData.resume
                            ? formData.resume.name
                            : "Upload Document"}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "coverLetter")}
                      className="hidden"
                      id="cover-letter-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="cover-letter-upload"
                      className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="text-center">
                        <FileText className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600">
                          {formData.coverLetter
                            ? formData.coverLetter.name
                            : "Upload Document"}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Interview..." : "Continue to Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
