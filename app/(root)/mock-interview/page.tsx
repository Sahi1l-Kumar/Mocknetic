import InterviewClient from "@/components/InterviewClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mock Interview - Practice Technical Interviews",
  description:
    "Practice technical interviews with AI-powered mock interviews. Get real-time feedback, improve your communication skills, and prepare for software engineering interviews.",
  keywords: [
    "mock interview",
    "AI interview practice",
    "technical interview prep",
    "coding interview practice",
    "software engineer interview",
    "interview simulation",
    "AI interviewer",
    "interview feedback",
    "technical screening prep",
  ],
  openGraph: {
    title: "Mock Interview - Practice Technical Interviews | Mocknetic",
    description:
      "Practice technical interviews with AI. Get real-time feedback and personalized questions.",
    url: "https://mocknetic.com/mock-interview",
    siteName: "Mocknetic",
    type: "website",
    images: [
      {
        url: "https://mocknetic.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mocknetic AI Mock Interview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mock Interview | Mocknetic",
    description:
      "Practice technical interviews with AI and get real-time feedback.",
    images: ["https://mocknetic.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://mocknetic.com/mock-interview",
  },
};

export default function Page() {
  return <InterviewClient />;
}
