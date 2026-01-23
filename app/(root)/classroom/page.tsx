import { redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/auth";
import ROUTES from "@/constants/routes";
import StudentClassroomsHub from "@/components/classroom/StudentClassroomsHub";

export const metadata: Metadata = {
  title: "My Classrooms - Virtual Learning Spaces | Mocknetic",
  description:
    "Access your virtual classrooms, join new classes with teacher codes, view assignments, and track your progress. Collaborate with teachers and classmates in real-time.",
  keywords: [
    "virtual classroom",
    "online classroom",
    "student classroom",
    "join classroom",
    "classroom portal",
    "online learning",
    "class assignments",
    "student portal",
    "classroom code",
    "teacher classroom",
  ],
  openGraph: {
    title: "My Classrooms | Mocknetic",
    description:
      "Access your virtual classrooms and join new classes with teacher codes.",
    url: "https://mocknetic.com/classroom",
    siteName: "Mocknetic",
    type: "website",
    images: [
      {
        url: "https://mocknetic.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mocknetic Virtual Classrooms",
      },
    ],
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://mocknetic.com/classroom",
  },
};

const StudentClassroomsPage = async () => {
  const session = await auth();

  if (!session) return redirect(ROUTES.SIGN_IN);

  return <StudentClassroomsHub />;
};

export default StudentClassroomsPage;
