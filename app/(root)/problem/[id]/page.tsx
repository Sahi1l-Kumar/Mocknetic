import ProblemPage from "@/components/ProblemPage";

interface Props {
  params: { id: string };
}

export default async function Problem({ params }: Props) {
  const problemId = await params.id;
  return <ProblemPage problemId={problemId} />;
}
