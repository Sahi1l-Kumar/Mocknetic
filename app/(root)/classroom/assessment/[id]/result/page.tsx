import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ROUTES from "@/constants/routes";
import AssessmentResult from "@/components/classroom/AssessmentResult";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const AssessmentResultPage = async ({ params }: PageProps) => {
  const session = await auth();

  if (!session) return redirect(ROUTES.SIGN_IN);

  const { id } = await params;

  return <AssessmentResult assessmentId={id} />;
};

export default AssessmentResultPage;
