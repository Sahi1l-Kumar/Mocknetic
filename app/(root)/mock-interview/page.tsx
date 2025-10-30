"use client";

import { useState } from "react";
import InterviewForm from "@/components/interview/InterviewForm";
import InterviewSetup from "@/components/interview/InterviewSetup";
import InterviewPage from "@/components/interview/InterviewPage";

type Page = "form" | "setup" | "interview";

interface FormData {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
  companyDescription: string;
  resume: File | null;
  coverLetter: File | null;
}

function Interview() {
  const [currentPage, setCurrentPage] = useState<Page>("form");
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setCurrentPage("setup");
  };

  const handleStartInterview = () => {
    setCurrentPage("interview");
  };

  const handleBackToForm = () => {
    setCurrentPage("form");
  };

  return (
    <>
      {currentPage === "form" && <InterviewForm onSubmit={handleFormSubmit} />}
      {currentPage === "setup" && (
        <InterviewSetup
          onStart={handleStartInterview}
          onBack={handleBackToForm}
        />
      )}
      {currentPage === "interview" && (
        <InterviewPage jobTitle={formData?.jobTitle || "Software Developer"} />
      )}
    </>
  );
}

export default Interview;
