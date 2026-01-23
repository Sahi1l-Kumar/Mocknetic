import SignInClient from "@/components/SignInClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Access Your Account | Mocknetic",
  description:
    "Sign in to Mocknetic to access your personalized learning dashboard, continue your coding practice, track your progress, and join virtual classrooms.",
  keywords: [
    "sign in",
    "login",
    "student login",
    "mocknetic login",
    "access account",
    "student portal login",
  ],
  openGraph: {
    title: "Sign In to Mocknetic",
    description:
      "Access your personalized learning dashboard and continue your coding journey.",
    url: "https://mocknetic.com/sign-in",
    siteName: "Mocknetic",
    type: "website",
    images: [
      {
        url: "https://mocknetic.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mocknetic Sign In",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://mocknetic.com/sign-in",
  },
};

export default function Page() {
  return <SignInClient />;
}
