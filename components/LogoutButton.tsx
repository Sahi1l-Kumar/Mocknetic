"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/lib/actions/auth.action";

const LogoutButton = () => {
  const [isPending, setIsPending] = useState(false);

  const onSignOut = async () => {
    try {
      setIsPending(true);
      await handleSignOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      setIsPending(false);
    }
  };

  return (
    <Button
      onClick={onSignOut}
      disabled={isPending}
      variant="outline"
      className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700 disabled:opacity-50"
    >
      <LogOut className="w-4 h-4" />
      <span>{isPending ? "Signing out..." : "Sign Out"}</span>
    </Button>
  );
};

export default LogoutButton;
