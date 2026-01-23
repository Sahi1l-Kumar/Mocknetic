import React from "react";
import { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard - Your Learning Hub | Mocknetic",
  description:
    "View your personalized learning dashboard with progress tracking, recent activity, upcoming assessments, and quick access to all your courses and practice sessions.",
  keywords: [
    "student dashboard",
    "learning dashboard",
    "progress tracking",
    "student portal",
    "online learning hub",
    "course dashboard",
    "assessment tracker",
  ],
  openGraph: {
    title: "Dashboard | Mocknetic",
    description:
      "Your personalized learning dashboard with progress tracking and quick access to all features.",
    url: "https://mocknetic.com/dashboard",
    siteName: "Mocknetic",
    type: "website",
    images: [
      {
        url: "https://mocknetic.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mocknetic Dashboard",
      },
    ],
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://mocknetic.com/dashboard",
  },
};

const DashboardPage = () => {
  return <Dashboard />;
};

export default DashboardPage;
