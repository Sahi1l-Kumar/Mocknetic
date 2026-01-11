import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ROUTES from "@/constants/routes";
import TakeAssessment from "@/components/classroom/TakeAssessment";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const TakeAssessmentPage = async ({ params }: PageProps) => {
  const session = await auth();

  if (!session) return redirect(ROUTES.SIGN_IN);

  const { id } = await params;

  return <TakeAssessment assessmentId={id} />;
};

export default TakeAssessmentPage;
