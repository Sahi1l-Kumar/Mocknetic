"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Mic, Video, VideoOff } from "lucide-react";

interface InterviewSetupProps {
  onStart: (devices: {
    cameraId: string;
    microphoneId: string;
    cameraEnabled: boolean;
  }) => void;
  onBack: () => void;
}

export default function InterviewSetup({
  onStart,
  onBack,
}: InterviewSetupProps) {
  const [devices, setDevices] = useState<{
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
  }>({
    cameras: [],
    microphones: [],
  });
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get devices only once on mount
  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const deviceList = await navigator.mediaDevices.enumerateDevices();

        const cameras = deviceList.filter(
          (device) => device.kind === "videoinput"
        );
        const microphones = deviceList.filter(
          (device) => device.kind === "audioinput"
        );

        setDevices({ cameras, microphones });

        if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
        if (microphones.length > 0)
          setSelectedMicrophone(microphones[0].deviceId);
      } catch (error) {
        console.error("Error getting devices:", error);
      }
    };

    getDevices();
  }, []);

  // Start stream when devices change
  useEffect(() => {
    if (!selectedCamera || !selectedMicrophone) return;

    let isActive = true;

    const startStream = async () => {
      try {
        // Stop existing stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const constraints = {
          video: cameraEnabled
            ? { deviceId: { exact: selectedCamera } }
            : false,
          audio: { deviceId: { exact: selectedMicrophone } },
        };

        const mediaStream =
          await navigator.mediaDevices.getUserMedia(constraints);

        if (!isActive) {
          // Component unmounted, stop the stream
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        setStream(mediaStream);

        if (videoRef.current && cameraEnabled) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (error) {
        console.error("Error starting stream:", error);
      }
    };

    startStream();

    return () => {
      isActive = false;
    };
  }, [selectedCamera, selectedMicrophone, cameraEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Update video element when camera is toggled
  useEffect(() => {
    if (videoRef.current) {
      if (cameraEnabled && stream) {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [cameraEnabled, stream]);

  const toggleCamera = () => {
    setCameraEnabled((prev) => !prev);
  };

  const handleStart = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track before starting interview`);
      });
    }

    setTimeout(() => {
      onStart({
        cameraId: selectedCamera,
        microphoneId: selectedMicrophone,
        cameraEnabled: cameraEnabled,
      });
    }, 100);
  };

  const handleBack = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track before going back`);
      });
    }

    setTimeout(() => {
      onBack();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Setup Your Interview Environment
          </h1>
          <p className="text-slate-600 mb-8">
            Choose your camera and microphone for the interview
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center mb-6 overflow-hidden">
                {cameraEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500">
                    <VideoOff className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">Camera is off</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleCamera}
                  className={`p-4 rounded-full transition-all ${
                    cameraEnabled
                      ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                  title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {cameraEnabled ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <VideoOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-slate-900 mb-3">
                  <Camera className="w-5 h-5 mr-2" />
                  Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  {devices.cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-slate-900 mb-3">
                  <Mic className="w-5 h-5 mr-2" />
                  Microphone
                </label>
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  {devices.microphones.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || `Microphone ${mic.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">
                  Tips for a great interview:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Find a quiet, well-lit space</li>
                  <li>• Check your camera angle and background</li>
                  <li>• Test your microphone volume</li>
                  <li>• Ensure stable internet connection</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
