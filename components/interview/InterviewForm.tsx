"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

interface InterviewFormProps {
  onSubmit: (data: FormData) => void;
}

interface FormData {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  companyDescription: string;
  resume: File | null;
  coverLetter: File | null;
}

export default function InterviewForm({ onSubmit }: InterviewFormProps) {
  const [formData, setFormData] = useState<FormData>({
    jobTitle: "",
    jobDescription: "",
    companyName: "",
    companyDescription: "",
    resume: null,
    coverLetter: null,
  });

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
      alert("Only PDF files are supported");
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobTitle || !formData.jobDescription) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-8">
            Interview Preparation
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="Enter job title"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                placeholder="Paste the job description here"
                rows={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Company Name (Optional)
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Company Description (Optional)
              </label>
              <textarea
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleInputChange}
                placeholder="Enter company description"
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Note: All documents must be in PDF format.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Resume (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "resume")}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <div className="text-center">
                        <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {formData.resume
                            ? formData.resume.name
                            : "Upload Document"}
                        </span>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only PDF files are supported
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Cover Letter (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, "coverLetter")}
                      className="hidden"
                      id="cover-letter-upload"
                    />
                    <label
                      htmlFor="cover-letter-upload"
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <div className="text-center">
                        <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {formData.coverLetter
                            ? formData.coverLetter.name
                            : "Upload Document"}
                        </span>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only PDF files are supported
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                Continue to Setup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
