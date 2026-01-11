"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

interface JoinClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const JoinClassroomModal = ({
  isOpen,
  onClose,
  onSuccess,
}: JoinClassroomModalProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!code || code.trim().length !== 6) {
      toast.error("Please enter a valid 6-character classroom code");
      return;
    }

    try {
      setLoading(true);
      const result = await api.student.joinClassroom(code.toUpperCase().trim());

      if (result.success) {
        toast.success("Joined classroom successfully!");
        setCode("");
        onClose();
        onSuccess();
      } else {
        toast.error(result.error?.message || "Failed to join classroom");
      }
    } catch (error) {
      console.error("Error joining classroom:", error);
      toast.error("Failed to join classroom");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCode("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Join a Class</DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter the 6-character code provided by your teacher
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-gray-700">
              Class Code
            </Label>
            <Input
              id="code"
              type="text"
              placeholder="ABC123"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().slice(0, 6))
              }
              maxLength={6}
              className="text-center text-2xl font-bold tracking-widest uppercase h-14 border-2 focus:border-blue-500"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleJoin();
                }
              }}
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Ask your teacher for the classroom code
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Class"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinClassroomModal;
