import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "Mocknetic - Online Learning Platform for Students & Educators",
    template: "%s | Mocknetic",
  },
  description:
    "Complete learning management platform for students and teachers. Join virtual classrooms, take coding assessments, practice mock interviews with AI, solve DSA problems, and build your skills. Mocknetic combines classroom learning with AI-powered interview preparation.",

  keywords: [
    // Classroom/LMS keywords
    "online learning platform",
    "virtual classroom",
    "student assessment platform",
    "online classroom for students",
    "coding assessment platform",
    "teacher student portal",
    "online quiz platform",
    "classroom management system",
    "student assignment portal",

    // Interview preparation keywords
    "mock interview platform",
    "AI interview practice",
    "coding interview preparation",
    "technical interview practice",
    "mock coding interview",

    // Technical skills keywords
    "DSA practice platform",
    "data structures algorithms",
    "coding problems online",
    "online code editor",
    "skill assessment test",
    "programming practice platform",

    // Student-focused keywords
    "student learning portal",
    "online education platform",
    "coding practice for students",
    "technical skills assessment",
  ],

  // Authors and creator info
  authors: [{ name: "Mocknetic Team" }],
  creator: "Mocknetic",
  publisher: "Mocknetic",

  // Base URL for all relative URLs
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://mocknetic.com"
  ),

  // Alternate languages
  alternates: {
    canonical: "/",
  },

  // Robots directives
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

  // App-specific metadata
  applicationName: "Mocknetic Student Portal",
  category: "Education",

  // Icons
  icons: {
    icon: [
      { url: "/mocknetic.svg" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  verification: {
    google: "your-google-verification-code",
  },
};

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await auth();

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Mocknetic",
    description:
      "Online learning platform combining classroom management with AI-powered interview preparation",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://mocknetic.com",
    applicationCategory: "EducationalApplication",
    offers: {
      "@type": "Offer",
      category: "Educational Services",
    },
    featureList: [
      "Virtual Classrooms",
      "Coding Assessments",
      "Mock Interviews",
      "AI-Powered Learning",
      "Skill Assessments",
      "Code Editor",
      "Resume Analysis",
    ],
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <SessionProvider session={session}>
          {children}
          <Analytics />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
