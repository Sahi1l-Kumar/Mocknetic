"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, Star } from "lucide-react";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const feedbackSchema = z.object({
  feedbackType: z.enum(["bug", "feature", "improvement", "other"]),
  message: z
    .string()
    .min(10, "Please provide at least 10 characters")
    .max(1000),
  rating: z.number().min(1).max(5).optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedbackType: "improvement",
      message: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          page: pathname,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      toast.success("Thank you for your feedback!");
      form.reset();
      setIsOpen(false);
      setHoverRating(null);
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-110 active:scale-95 touch-manipulation"
        aria-label="Send feedback"
      >
        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px] w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Send Feedback
            </DialogTitle>
            <DialogDescription className="text-sm">
              Help us improve Mocknetic by sharing your thoughts
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email (read-only) */}
              <FormItem>
                <FormLabel className="text-sm">Email</FormLabel>
                <Input
                  value={session.user.email || ""}
                  disabled
                  className="bg-muted text-sm"
                />
              </FormItem>

              {/* Feedback Type */}
              <FormField
                control={form.control}
                name="feedbackType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Select feedback type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug">🐛 Bug Report</SelectItem>
                        <SelectItem value="feature">
                          ✨ Feature Request
                        </SelectItem>
                        <SelectItem value="improvement">
                          🚀 Improvement
                        </SelectItem>
                        <SelectItem value="other">💭 Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Tell us what you think..."
                        rows={4}
                        className="resize-none text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Star Rating with Hover Effect */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Rating (optional)</FormLabel>
                    <div
                      className="flex gap-1 sm:gap-2"
                      onMouseLeave={() => setHoverRating(null)}
                    >
                      {[1, 2, 3, 4, 5].map((rating) => {
                        const isActive =
                          (hoverRating ?? field.value ?? 0) >= rating;
                        return (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => field.onChange(rating)}
                            onMouseEnter={() => setHoverRating(rating)}
                            className="touch-manipulation transition-transform active:scale-90 hover:scale-110 p-1"
                            aria-label={`Rate ${rating} stars`}
                          >
                            <Star
                              className={`h-7 w-7 sm:h-8 sm:w-8 transition-all duration-150 ${
                                isActive
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-transparent text-gray-300"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    {(field.value || hoverRating) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {hoverRating || field.value} out of 5 stars
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto text-sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
