import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ROUTES from "@/constants/routes";
import ClassroomDetail from "@/components/classroom/ClassroomDetail";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const ClassroomDetailPage = async ({ params }: PageProps) => {
  const session = await auth();

  if (!session) return redirect(ROUTES.SIGN_IN);

  const { id } = await params;

  return <ClassroomDetail classroomId={id} />;
};

export default ClassroomDetailPage;
