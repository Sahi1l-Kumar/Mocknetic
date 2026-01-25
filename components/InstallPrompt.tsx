"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PromptData {
  visitCount: number;
  lastDismissed: number;
  permanentlyDismissed: boolean;
}

const InstallPrompt = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const getPromptData = useCallback((): PromptData => {
    if (typeof window === "undefined") {
      return {
        visitCount: 0,
        lastDismissed: 0,
        permanentlyDismissed: false,
      };
    }

    const stored = localStorage.getItem("pwa-install-data");
    if (stored) {
      return JSON.parse(stored) as PromptData;
    }
    return {
      visitCount: 0,
      lastDismissed: 0,
      permanentlyDismissed: false,
    };
  }, []);

  const updatePromptData = useCallback(
    (updates: Partial<PromptData>) => {
      if (typeof window === "undefined") return;

      const current = getPromptData();
      const updated = { ...current, ...updates };
      localStorage.setItem("pwa-install-data", JSON.stringify(updated));
    },
    [getPromptData],
  );

  const shouldShowPrompt = useCallback((): boolean => {
    const data = getPromptData();

    if (data.permanentlyDismissed) {
      return false;
    }

    if (data.visitCount < 3) {
      return false;
    }

    if (data.lastDismissed > 0) {
      const daysSinceDismissed =
        (Date.now() - data.lastDismissed) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return false;
      }
    }

    return data.visitCount % 3 === 0;
  }, [getPromptData]);

  useEffect(() => {
    setIsMounted(true);

    // FOR DEVELOPMENT ONLY - Force show for testing
    if (process.env.NODE_ENV === "development") {
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    const data = getPromptData();
    updatePromptData({ visitCount: data.visitCount + 1 });

    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    if (standalone) {
      return;
    }

    if (!shouldShowPrompt() && process.env.NODE_ENV !== "development") {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [getPromptData, updatePromptData, shouldShowPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        "To install:\n\n" +
          "Chrome: Click the ⊕ icon in the address bar\n" +
          "Edge: Click Settings → Apps → Install this site as an app",
      );
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      localStorage.removeItem("pwa-install-data");
    } else {
      updatePromptData({ lastDismissed: Date.now() });
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    updatePromptData({ lastDismissed: Date.now() });
    setShowPrompt(false);
  };

  const handleNeverShow = () => {
    updatePromptData({
      permanentlyDismissed: true,
      lastDismissed: Date.now(),
    });
    setShowPrompt(false);
  };

  if (!isMounted) {
    return null;
  }

  if (isStandalone) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  // iOS-specific prompt
  if (isIOS) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
        <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-4 text-white border border-white/10 max-w-xs">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/icon-192.png"
              alt="Mocknetic"
              width={48}
              height={48}
              className="rounded-xl shadow-lg"
            />
            <div>
              <h3 className="font-bold text-base">Install Mocknetic</h3>
              <p className="text-xs text-blue-100">Tap Share → Add to Home</p>
            </div>
          </div>

          <button
            onClick={handleNeverShow}
            className="text-xs text-blue-100 hover:text-white underline w-full text-center"
          >
            Don&apos;t show again
          </button>
        </div>
      </div>
    );
  }

  // Chrome/Edge/Desktop prompt (ALWAYS shows in development)
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-xs relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Image
            src="/icon-192.png"
            alt="Mocknetic"
            width={56}
            height={56}
            className="rounded-2xl shadow-lg"
          />
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Install Mocknetic
            </h3>
            <p className="text-xs text-slate-600">Quick access & offline</p>
          </div>
        </div>

        <button
          onClick={handleInstallClick}
          className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
        >
          <Download className="w-4 h-4" />
          Install App
        </button>

        <button
          onClick={handleNeverShow}
          className="w-full text-center text-xs text-slate-500 hover:text-slate-700 mt-2 transition-colors"
        >
          Don&apos;t show again
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
