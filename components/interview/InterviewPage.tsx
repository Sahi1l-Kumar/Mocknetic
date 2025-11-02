"use client";

import React, { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Video, VideoOff, Mic, Copy, Check } from "lucide-react";

interface Question {
  question: string;
  tts_url: string;
  question_number: number;
  auto_listen: boolean;
  timestamp: number;
}

interface QAHistory {
  question: string;
  answer: string;
  questionNumber: number;
}

export default function InterviewPage({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [qaHistory, setQaHistory] = useState<QAHistory[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingStatus, setRecordingStatus] = useState<string>("idle");
  const [questionsAnswered, setQuestionsAnswered] = useState<number>(0);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [isEnding, setIsEnding] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceDetectionRef = useRef<number | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  const SILENCE_SECONDS = 10;
  const SILENCE_THRESHOLD = 30;
  const PYTHON_API =
    process.env.NEXT_PUBLIC_PYTHON_API || "http://localhost:5000";

  const cleanupAllResources = () => {
    console.log("🧹 Cleaning up all resources...");

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn("MediaRecorder already stopped");
      }
    }
    mediaRecorderRef.current = null;

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Audio track stop error:", e);
        }
      });
      audioStreamRef.current = null;
    }

    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Video track stop error:", e);
        }
      });
      videoStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.warn("Audio context close error:", e);
      }
      audioContextRef.current = null;
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    if (silenceDetectionRef.current) {
      cancelAnimationFrame(silenceDetectionRef.current);
      silenceDetectionRef.current = null;
    }

    console.log("✅ All resources cleaned up");
  };

  const initializeAudio = async () => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
        video: false,
      });
      audioStreamRef.current = audioStream;

      let videoStream: MediaStream | null = null;
      if (cameraEnabled) {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        videoStreamRef.current = videoStream;

        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      }

      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;

      const source =
        audioContextRef.current.createMediaStreamSource(audioStream);

      source.connect(analyzerRef.current);

      const mimeType = "audio/webm";
      mediaRecorderRef.current = new MediaRecorder(audioStream, { mimeType });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = handleRecordingStop;

      console.log("✅ Audio & Video initialized (echo suppression enabled)");
    } catch (error) {
      console.error("❌ Audio/Video initialization error:", error);
      isInitializedRef.current = false;
      setRecordingStatus("error");
      toast.error("Microphone/Camera access denied");
    }
  };

  const startRecording = async () => {
    try {
      if (!mediaRecorderRef.current) {
        await initializeAudio();
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "inactive"
      ) {
        chunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setRecordingStatus("recording");

        console.log("🎤 Recording started");

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        silenceTimeoutRef.current = setTimeout(() => {
          console.log("⏱️ Silence timeout - stopping recording");
          stopRecording();
        }, SILENCE_SECONDS * 1000);

        detectSilence();
      }
    } catch (error) {
      console.error("❌ Recording start error:", error);
      setRecordingStatus("error");
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    try {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setRecordingStatus("processing");

        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        if (silenceDetectionRef.current) {
          cancelAnimationFrame(silenceDetectionRef.current);
        }

        console.log("⏹️ Recording stopped");
      }
    } catch (error) {
      console.error("❌ Recording stop error:", error);
      setRecordingStatus("error");
      toast.error("Failed to stop recording");
    }
  };

  const detectSilence = () => {
    if (!analyzerRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

    if (average < SILENCE_THRESHOLD) {
      console.log("🤐 Silence detected");
    }

    silenceDetectionRef.current = requestAnimationFrame(detectSilence);
  };

  const handleRecordingStop = async () => {
    try {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });

      if (blob.size === 0) {
        console.warn("⚠️ Empty audio blob");
        setRecordingStatus("idle");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const audioData = reader.result as string;
        const base64Audio = audioData.split(",")[1];

        socket.emit("send_audio_chunk", {
          session_id: sessionId,
          audio_data: base64Audio,
          is_final: true,
          timestamp: Date.now(),
        });

        console.log("📤 Audio sent to server");
        setRecordingStatus("waiting");
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("❌ Recording stop error:", error);
      setRecordingStatus("error");
      toast.error("Failed to process recording");
    }
  };

  const playAndAutoListen = async (
    tts_url: string,
    audioElementsToCleanup: HTMLAudioElement[]
  ) => {
    try {
      const absoluteUrl = tts_url.startsWith("http")
        ? tts_url
        : `${PYTHON_API}${tts_url}`;

      console.log("🔊 Playing TTS:", absoluteUrl);

      const audio = new Audio();
      audio.src = absoluteUrl;
      audio.volume = 0.8;
      audio.crossOrigin = "anonymous"; // Add CORS support

      audioElementsToCleanup.push(audio);

      let hasErrored = false; // Track if error already fired

      audio.onplay = () => {
        console.log("▶️ TTS audio playing");
        hasErrored = false; // Reset error flag on successful play
      };

      audio.onended = () => {
        console.log("✅ TTS audio finished");
        audio.pause();
        audio.src = "";

        const index = audioElementsToCleanup.indexOf(audio);
        if (index > -1) {
          audioElementsToCleanup.splice(index, 1);
        }

        setTimeout(() => {
          startRecording();
        }, 500);
      };

      // Only show error once
      audio.onerror = (error) => {
        if (hasErrored) return; // Don't show error multiple times
        hasErrored = true;

        // console.error("❌ Audio play error:", error);
        // Don't show toast - audio might still work via fallback
        console.warn("Attempting to play audio anyway...");

        audio.pause();
        audio.src = "";

        const index = audioElementsToCleanup.indexOf(audio);
        if (index > -1) {
          audioElementsToCleanup.splice(index, 1);
        }

        setTimeout(() => {
          startRecording();
        }, 500);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("✅ Audio play successful");
          })
          .catch((err) => {
            if (hasErrored) return;
            hasErrored = true;

            console.error("❌ Audio play rejected:", err);
            // Silent fail - still start recording
            setTimeout(() => startRecording(), 500);
          });
      }
    } catch (error) {
      console.error("❌ Audio handling error:", error);
      startRecording();
    }
  };

  const toggleCamera = async () => {
    try {
      if (cameraEnabled) {
        if (videoStreamRef.current) {
          videoStreamRef.current.getTracks().forEach((track) => track.stop());
          videoStreamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraEnabled(false);
        toast.success("Camera turned off");
      } else {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        videoStreamRef.current = videoStream;

        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
        setCameraEnabled(true);
        toast.success("Camera turned on");
      }
    } catch (error) {
      console.error("❌ Camera toggle error:", error);
      toast.error("Failed to toggle camera");
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleEndInterview = () => {
    if (isEnding) return;
    setIsEnding(true);

    console.log("🛑 Ending interview...");

    socket.emit("end_interview", { session_id: sessionId });

    setTimeout(() => {
      cleanupAllResources();
      toast.success("Interview ended successfully");

      setTimeout(() => {
        router.push("/");
      }, 500);
    }, 1000);
  };

  // Socket listeners effect - FIXED
  useEffect(() => {
    let isComponentMounted = true;
    let audioElementsToCleanup: HTMLAudioElement[] = [];

    function onConnect() {
      if (!isComponentMounted) return;
      console.log("✅ Socket connected");
      setIsSocketConnected(true);
      socket.emit("join_interview", { session_id: sessionId });
    }

    function onDisconnect() {
      if (!isComponentMounted) return;
      console.log("❌ Socket disconnected");
      setIsSocketConnected(false);
    }

    function onReceiveQuestion(data: Question) {
      if (!isComponentMounted) return;

      console.log("📨 Question received:", data.question);

      // Stop any currently playing audio
      audioElementsToCleanup.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioElementsToCleanup = [];

      setCurrentQuestion(data);
      setTranscript("");
      setRecordingStatus("idle");

      if (data.auto_listen && data.tts_url) {
        playAndAutoListen(data.tts_url, audioElementsToCleanup);
      }
    }

    function onTranscriptReceived(data: { transcript: string }) {
      if (!isComponentMounted) return;

      console.log("📝 Transcript received:", data.transcript);
      setTranscript(data.transcript);

      setQaHistory((prev) => {
        const newHistory = [
          ...prev,
          {
            question: currentQuestion?.question || "",
            answer: data.transcript,
            questionNumber: currentQuestion?.question_number || 0,
          },
        ];
        return newHistory;
      });

      setQuestionsAnswered((prev) => prev + 1);
      setRecordingStatus("waiting_for_next");
    }

    function onRecordingStatus(data: { status: string }) {
      if (!isComponentMounted) return;
      console.log("📊 Recording status:", data.status);
      setRecordingStatus(data.status);
    }

    function onInterviewComplete(data: any) {
      if (!isComponentMounted) return;

      console.log("🎉 Interview complete!", data);
      setRecordingStatus("complete");
      setCurrentQuestion(null);
      toast.success("Interview completed!");

      setTimeout(() => {
        if (isComponentMounted) {
          handleEndInterview();
        }
      }, 2000);
    }

    function onError(data: { message: string }) {
      if (!isComponentMounted) return;
      console.error("❌ Socket error:", data.message);
      setRecordingStatus("error");
      toast.error(data.message);
    }

    if (socket.connected) {
      onConnect();
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_question", onReceiveQuestion);
    socket.on("transcript_received", onTranscriptReceived);
    socket.on("recording_status", onRecordingStatus);
    socket.on("interview_complete", onInterviewComplete);
    socket.on("error", onError);

    return () => {
      isComponentMounted = false;

      audioElementsToCleanup.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      audioElementsToCleanup = [];

      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_question", onReceiveQuestion);
      socket.off("transcript_received", onTranscriptReceived);
      socket.off("recording_status", onRecordingStatus);
      socket.off("interview_complete", onInterviewComplete);
      socket.off("error", onError);
    };
  }, [sessionId]);

  useEffect(() => {
    return () => {
      cleanupAllResources();
    };
  }, []);

  const getStatusColor = () => {
    switch (recordingStatus) {
      case "recording":
        return "bg-red-100 text-red-700 border border-red-300";
      case "processing":
        return "bg-amber-100 text-amber-700 border border-amber-300";
      case "waiting":
        return "bg-green-100 text-green-700 border border-green-300";
      case "waiting_for_next":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "error":
        return "bg-red-100 text-red-700 border border-red-300";
      case "complete":
        return "bg-green-100 text-green-700 border border-green-300";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-300";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Interview In Progress
          </h1>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
            <Mic className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-600">
              {questionsAnswered} / 5
            </span>
          </div>
        </div>

        {!isSocketConnected && (
          <div className="bg-amber-100 border border-amber-300 text-amber-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>Connecting to server...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Video Feed - 1 col */}
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden relative shadow-md">
              {cameraEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-slate-400 text-center">
                  <VideoOff className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Camera Off</p>
                </div>
              )}
            </div>

            <button
              onClick={toggleCamera}
              disabled={isEnding}
              className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                cameraEnabled
                  ? "bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:opacity-50"
                  : "bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
              }`}
            >
              {cameraEnabled ? (
                <>
                  <Video className="w-4 h-4" />
                  Turn Off
                </>
              ) : (
                <>
                  <VideoOff className="w-4 h-4" />
                  Turn On
                </>
              )}
            </button>

            <p className="text-xs text-slate-600 text-center">Your Camera</p>
          </div>

          {/* Question - 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm h-80 overflow-y-auto space-y-3">
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-blue-100 pb-2">
                <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Question {currentQuestion?.question_number || "—"}
                </div>
              </div>
              {currentQuestion ? (
                <div className="text-lg text-slate-800 leading-relaxed font-medium">
                  "{currentQuestion.question}"
                </div>
              ) : (
                <div className="text-slate-500 italic text-center py-12">
                  Waiting for question...
                </div>
              )}
            </div>

            {/* Recording Status */}
            <div className="flex justify-center">
              <div
                className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all shadow-sm ${getStatusColor()}`}
              >
                {recordingStatus === "recording" && (
                  <>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    <span>Recording...</span>
                  </>
                )}
                {recordingStatus === "processing" && (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Processing...</span>
                  </>
                )}
                {recordingStatus === "waiting" && (
                  <>
                    <span>✓</span>
                    <span>Waiting for next...</span>
                  </>
                )}
                {recordingStatus === "waiting_for_next" && (
                  <>
                    <span className="animate-spin">✨</span>
                    <span>Generating...</span>
                  </>
                )}
                {recordingStatus === "error" && (
                  <>
                    <span>❌</span>
                    <span>Error</span>
                  </>
                )}
                {recordingStatus === "complete" && (
                  <>
                    <span>🎉</span>
                    <span>Complete!</span>
                  </>
                )}
                {recordingStatus === "idle" && (
                  <>
                    <span>🎤</span>
                    <span>Ready</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Current Transcript - 2 cols */}
          <div className="lg:col-span-2 space-y-2">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 p-6 rounded-lg h-80 overflow-y-auto shadow-sm">
              <h3 className="font-bold text-green-700 mb-4 text-lg sticky top-0 bg-gradient-to-r from-green-50 to-green-100 pb-2">
                Your Answer
              </h3>
              {transcript ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <p className="text-slate-700 leading-relaxed">
                      {transcript}
                    </p>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    ✓ Transcribed in real-time
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 italic text-center py-20">
                  <Mic className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Your answer will appear here...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QA History */}
        {qaHistory.length > 0 && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6 space-y-4 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                {qaHistory.length}
              </span>
              Q&A History
            </h2>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {qaHistory.map((qa, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Question */}
                  <div className="flex gap-3 mb-3">
                    <span className="flex-shrink-0 bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-full text-xs">
                      Q{qa.questionNumber}
                    </span>
                    <p className="text-sm font-medium text-slate-700 flex-1">
                      {qa.question}
                    </p>
                  </div>

                  {/* Answer */}
                  <div className="flex gap-3 ml-3 border-l-2 border-green-300 pl-3">
                    <span className="flex-shrink-0 bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full text-xs">
                      A
                    </span>
                    <div className="flex-1 flex items-start gap-2">
                      <p className="text-sm text-slate-600 leading-relaxed flex-1">
                        {qa.answer}
                      </p>
                      <button
                        onClick={() => copyToClipboard(qa.answer, idx)}
                        className="flex-shrink-0 p-1.5 hover:bg-slate-100 rounded-md transition-colors"
                        title="Copy answer"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            onClick={handleEndInterview}
            disabled={isEnding}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {isEnding ? "Ending..." : "End Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}
