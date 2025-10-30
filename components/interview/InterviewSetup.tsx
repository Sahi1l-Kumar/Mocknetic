"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Mic, Video, VideoOff } from "lucide-react";

interface InterviewSetupProps {
  onStart: () => void;
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

  useEffect(() => {
    getDevices();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (selectedCamera && selectedMicrophone) {
      startStream();
    }
  }, [selectedCamera, selectedMicrophone, cameraEnabled]);

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

  const startStream = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: cameraEnabled
          ? { deviceId: selectedCamera ? { exact: selectedCamera } : undefined }
          : false,
        audio: {
          deviceId: selectedMicrophone
            ? { exact: selectedMicrophone }
            : undefined,
        },
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current && cameraEnabled) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  const toggleCamera = () => {
    setCameraEnabled((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Setup Your Interview Environment
          </h1>
          <p className="text-gray-600 mb-8">
            Choose your camera and microphone for the interview
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center mb-6 overflow-hidden">
                {cameraEnabled ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500">
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
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
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
                <label className="flex items-center text-sm font-medium text-gray-900 mb-3">
                  <Camera className="w-5 h-5 mr-2" />
                  Camera
                </label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  {devices.cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-900 mb-3">
                  <Mic className="w-5 h-5 mr-2" />
                  Microphone
                </label>
                <select
                  value={selectedMicrophone}
                  onChange={(e) => setSelectedMicrophone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
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

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={onStart}
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
