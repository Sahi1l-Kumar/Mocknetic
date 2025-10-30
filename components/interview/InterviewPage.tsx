"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, ChevronDown } from "lucide-react";

interface InterviewPageProps {
  jobTitle: string;
}

export default function InterviewPage({ jobTitle }: InterviewPageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [microphoneStatus, setMicrophoneStatus] = useState<"on" | "off">("on");
  const [cameraStatus, setCameraStatus] = useState<"on" | "off">("off");
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const questions = [
    "Tell me about yourself and your background.",
    "What interests you about this position?",
    "Describe a challenging project you worked on.",
    "How do you handle tight deadlines?",
    "Where do you see yourself in five years?",
  ];

  useEffect(() => {
    initializeMedia();
    setTimeout(() => {
      setIsLoading(false);
      setCurrentQuestion(questions[0]);
    }, 2000);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const initializeMedia = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const toggleMicrophone = () => {
    setMicrophoneStatus((prev) => (prev === "on" ? "off" : "on"));
  };

  const toggleCamera = () => {
    setCameraStatus((prev) => (prev === "on" ? "off" : "on"));
  };

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                    <div className="absolute bottom-4 left-4 bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium">
                      AI Interviewer
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden relative">
                  {cameraStatus === "on" ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800" />
                  )}
                  <div className="absolute bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium">
                    You
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Interview Questions
                </h3>
                {isLoading ? (
                  <p className="text-gray-500 italic">
                    Waiting for interview questions...
                  </p>
                ) : (
                  <p className="text-gray-700">{currentQuestion}</p>
                )}
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-2">
                  <span className="text-sm text-gray-700">Microphone:</span>
                  <button
                    onClick={toggleMicrophone}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                      microphoneStatus === "on"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {microphoneStatus === "on" ? "On" : "Off"}
                  </button>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-4 py-2">
                  <span className="text-sm text-gray-700">Camera:</span>
                  <button
                    onClick={toggleCamera}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
                      cameraStatus === "on"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {cameraStatus === "on" ? "On" : "Off"}
                  </button>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mic className="w-4 h-4" />
                    Press to speak
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-all flex items-center gap-2 animate-pulse"
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                    Recording...
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border-t border-gray-200 p-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Question 1</span> of{" "}
              {questions.length}
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all">
              Unlock Unlimited Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
