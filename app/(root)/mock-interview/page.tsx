"use client";

import { useState } from "react";
import InterviewForm from "@/components/interview/InterviewForm";
import InterviewSetup from "@/components/interview/InterviewSetup";
import InterviewPage from "@/components/interview/InterviewPage";

type PageType = "form" | "setup" | "interview";

export default function Interview() {
  const [currentPage, setCurrentPage] = useState<PageType>("form");
  const [sessionId, setSessionId] = useState<string>("");
  const [selectedDevices, setSelectedDevices] = useState<{
    cameraId: string;
    microphoneId: string;
    cameraEnabled: boolean;
  } | null>(null);

  const handleFormSubmit = (id: string) => {
    setSessionId(id);
    setCurrentPage("setup");
  };

  const handleSetupComplete = (devices: {
    cameraId: string;
    microphoneId: string;
    cameraEnabled: boolean;
  }) => {
    setSelectedDevices(devices);
    setCurrentPage("interview");
  };

  const handleBack = () => {
    setCurrentPage("form");
  };

  return (
    <>
      {currentPage === "form" && (
        <InterviewForm
          onSubmit={(id) => {
            handleFormSubmit(id);
          }}
        />
      )}

      {currentPage === "setup" && (
        <InterviewSetup onStart={handleSetupComplete} onBack={handleBack} />
      )}

      {currentPage === "interview" && sessionId && (
        <InterviewPage
          sessionId={sessionId}
          selectedDevices={selectedDevices}
        />
      )}
    </>
  );
}
