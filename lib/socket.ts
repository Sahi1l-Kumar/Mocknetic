"use client";

import { io } from "socket.io-client";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API || "http://localhost:5000";

console.log("🔌 Socket connecting to:", PYTHON_API);

let socketInstance: ReturnType<typeof io> | null = null;
let isInitializing = false;

const getSocket = () => {
  if (isInitializing) {
    return socketInstance;
  }

  if (!socketInstance) {
    isInitializing = true;

    socketInstance = io(PYTHON_API, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
      path: "/socket.io/",
      secure: false,
      rejectUnauthorized: false,
      forceNew: false,
      autoConnect: true,
      multiplex: true,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected successfully");
      isInitializing = false;
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socketInstance.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  }

  return socketInstance;
};

export const socket = getSocket();
