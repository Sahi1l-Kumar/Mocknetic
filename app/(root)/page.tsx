import HomePageClient from "@/components/HomePageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mocknetic - AI-Powered Learning Platform for Students & Teachers",
  description:
    "Join virtual classrooms, practice coding problems, take AI mock interviews, and get personalized skill assessments. Complete learning management platform combining classroom learning with AI-powered interview preparation.",
  keywords: [
    "online learning platform",
    "AI mock interview",
    "virtual classroom",
    "coding practice",
    "skill assessment",
    "technical interview prep",
    "student portal",
    "online education",
    "LMS platform",
    "AI interviewer",
    "coding assessment",
    "teacher student platform",
    "personalized learning",
    "B.Tech learning platform",
  ],
  openGraph: {
    title: "Mocknetic - AI-Powered Learning Platform for Students & Teachers",
    description:
      "Join virtual classrooms, practice coding, take AI mock interviews, and get personalized skill assessments. Start your learning journey today.",
    url: "https://mocknetic.com",
    siteName: "Mocknetic",
    type: "website",
    images: [
      {
        url: "https://mocknetic.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mocknetic - AI-Powered Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mocknetic - AI-Powered Learning Platform",
    description:
      "Join virtual classrooms, practice coding, take AI mock interviews, and get personalized skill assessments.",
    images: ["https://mocknetic.com/og-image.png"],
    creator: "@mocknetic",
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
    canonical: "https://mocknetic.com",
  },
};

export default function Page() {
  return <HomePageClient />;
}
