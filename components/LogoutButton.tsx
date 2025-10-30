"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { handleSignOut } from "@/lib/actions/auth.action";

const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();

  const onSignOut = () => {
    startTransition(async () => {
      await handleSignOut();
    });
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
