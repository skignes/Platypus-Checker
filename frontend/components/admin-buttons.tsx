import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { runJenkinsJob } from "@/lib/api";

import jenkinsLogo from "@/public/jenkins.png";

interface AdminButtonProps {
  project: string;
}

function RunJobButton({ project }: AdminButtonProps) {
  const [folderName, ...rest] = project.split("-");
  const projectName = rest.join("-");

  return (
    <Button
      className="h-10 bg-platypus hover:bg-platypus/75"
      onClick={() => runJenkinsJob(folderName, projectName)}
    >
      <Play />
      <span>Run Tests</span>
    </Button>
  );
}

function ViewInJenkinsButton({ projectUrl }: { projectUrl: string }) {
  return (
    <Link href={projectUrl} target="_blank">
      <Button className="h-10 bg-platypus hover:bg-platypus/75">
        <Image src={jenkinsLogo} width={25} height={25} alt="" />
        <span>View In Jenkins</span>
      </Button>
    </Link>
  );
}

export { RunJobButton, ViewInJenkinsButton };
