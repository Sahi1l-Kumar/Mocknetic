"use client";

import { io } from "socket.io-client";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API || "http://localhost:5000";

let socketInstance: ReturnType<typeof io> | null = null;

export const socket = (() => {
  if (!socketInstance) {
    socketInstance = io(PYTHON_API, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
      path: "/socket.io",
      secure: false,
      rejectUnauthorized: false
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    socketInstance.on("connect", () => {
      console.log("✅ Connected to Python backend");
    });
  }

  return socketInstance;
})();
