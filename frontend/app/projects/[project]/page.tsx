import { use } from "react";

import ClientPage from "../[project]/ResultPage";

interface ResultPageProps {
  params: Promise<{ project: string }>;
};

export default function ResultPage({ params }: ResultPageProps) {
  const { project } = use<{ project: string }>(params);

  return <ClientPage project={project} />;
}
