import SignUpClient from "@/components/SignUpClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Create Your Free Account | Mocknetic",
  description:
    "Create a free Mocknetic account to start your coding journey. Access 3000+ coding problems, AI mock interviews, skill assessments, and join virtual classrooms.",
  keywords: [
    "sign up",
    "create account",
    "register",
    "student registration",
    "free account",
    "join mocknetic",
    "student signup",
  ],
  openGraph: {
    title: "Sign Up for Mocknetic - Start Your Coding Journey",
    description:
      "Create a free account to access coding problems, AI interviews, and personalized learning.",
    url: "https://mocknetic.com/sign-up",
    siteName: "Mocknetic",
    type: "website",
    images: [
      {
        url: "https://mocknetic.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mocknetic Sign Up",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://mocknetic.com/sign-up",
  },
};

export default function Page() {
  return <SignUpClient />;
}
