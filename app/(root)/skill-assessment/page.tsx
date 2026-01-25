import SkillAssessmentClient from "@/components/SkillAssessmentClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Assessment - Evaluate Your Technical Skills",
  description:
    "Take personalized skill gap assessments for any job role. Get AI-generated questions, instant feedback, and targeted learning recommendations to improve your technical skills.",
  keywords: [
    "skill assessment test",
    "technical skills evaluation",
    "skill gap analysis",
    "AI skill assessment",
    "programming skills test",
    "career readiness assessment",
    "job role assessment",
    "B.Tech skill assessment",
    "software engineer assessment",
  ],
  openGraph: {
    title: "Skill Assessment - Evaluate Your Technical Skills | Mocknetic",
    description:
      "Take personalized skill gap assessments with AI-generated questions and get instant feedback.",
    url: "https://mocknetic.com/skill-assessment",
    siteName: "Mocknetic",
    type: "website",
    images: [
      {
        url: "https://mocknetic.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mocknetic AI Skill Assessment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Assessment | Mocknetic",
    description:
      "Take personalized skill gap assessments with AI-generated questions.",
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
    canonical: "https://mocknetic.com/skill-assessment",
  },
};

export default function Page() {
  return <SkillAssessmentClient />;
}
