import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ROUTES from "@/constants/routes";
import StudentClassroomsHub from "@/components/classroom/StudentClassroomsHub";

const StudentClassroomsPage = async () => {
  const session = await auth();

  if (!session) return redirect(ROUTES.SIGN_IN);

  return <StudentClassroomsHub />;
};

export default StudentClassroomsPage;
