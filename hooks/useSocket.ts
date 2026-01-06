"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    function onConnect() {
      console.log("✅ Socket connected");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("❌ Socket disconnected");
      setIsConnected(false);
    }

    if (socket?.connected) {
      setIsConnected(true);
    }

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);

    return () => {
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket, isConnected };
};
