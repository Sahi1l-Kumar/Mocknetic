"use client";

import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message: string;
  className?: string;
}

export const LoadingOverlay = ({
  message,
  className = "",
}: LoadingOverlayProps) => {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
    >
      <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="mt-4 text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};
