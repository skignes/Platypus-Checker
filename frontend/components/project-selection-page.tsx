"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, GitBranch, GitCommit } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { LoadingSpinner } from "./loading-spinner";
import { getJenkinsProjects } from "@/lib/api";
import { ProjectBuild, ProjectPreview } from "@/lib/definitions";
import { calculatePassRate, getEllapsedTime } from "@/lib/utils";

function EllapsedTime({ timestamp }: { timestamp: string }) {
  const [label, setLabel] = useState(getEllapsedTime(timestamp));

  useEffect(() => {
    const id = setInterval(() => {
      setLabel(getEllapsedTime(timestamp));
    }, 1000);
    return () => clearInterval(id);
  }, [timestamp]);

  return (
    <div className="flex items-center text-zinc-400">
      <Clock className="h-3 w-3 mr-1" />
      <span>{label}</span>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectPreview }) {
  const build = project.build.deliveryError ? undefined : project.build.build;
  const passRate = project.build.deliveryError
    ? 0
    : calculatePassRate(project.build as ProjectBuild);
  const totalTests =
    project.build.deliveryError || !build
      ? 0
      : build.failCount + build.skipCount + build.passCount;
  const timestamp =
    project.build.deliveryError || !build ? "" : build.suites[0].timestamp;
  const commit = project.build.deliveryError
    ? undefined
    : Object.values(
        project.build.git.buildsByBranchName,
      )[0].revision.SHA1.slice(0, 7);

  console.log("URL", project.projectUrl);

  const getStatusColor = () => {
    let statusColor =
      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-300/10";

    if (passRate <= 50) {
      statusColor =
        "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-300/10";
    } else if (passRate < 90) {
      statusColor =
        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-300/10";
    }
    return statusColor;
  };

  const distributionData =
    project.build.deliveryError || !build
      ? []
      : [
          {
            name: "passed",
            value: build.passCount,
            color: "#10b981",
          },
          {
            name: "failed",
            value: build.failCount,
            color: "#ef4444",
          },
          {
            name: "skipped",
            value: build.skipCount,
            color: "#444444",
          },
        ];

  return (
    <Link href={project.projectUrl}>
      <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-platypus font-bold text-2xl group-hover:underline transition-colors">
                {project.displayName}
              </CardTitle>
            </div>
            {project.build.deliveryError ? (
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-300/10">
                Delivery Error
              </Badge>
            ) : (
              <Badge className={`ml-2 ${getStatusColor()}`}>
                {passRate <= 50
                  ? "failure"
                  : passRate < 90
                    ? "warning"
                    : "success"}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">
                  Pass Rate
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-emerald-500">
                    {passRate}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${passRate}%` }}
                ></div>
              </div>
            </div>
            {!project.build.deliveryError && (
              <div className="ml-4 w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={30}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="grid grid-rows-2 gap-4 text-sm">
            <div className="flex flex-row justify-between items-center">
              <EllapsedTime timestamp={timestamp} />
              {!project.build.deliveryError && (
                <div className="text-zinc-300">
                  <span className="font-medium">{totalTests}</span>
                  <span className="text-zinc-500 ml-1">tests</span>
                </div>
              )}
            </div>
            <div className="flex flex-row justify-between items-center">
              <div className="flex items-center text-zinc-400">
                <GitBranch className="h-3 w-3 mr-1" />
                <span className="truncate">main</span>
              </div>
              {commit && (
                <div className="flex items-center text-zinc-400">
                  <span className="truncate">{commit}</span>
                  <GitCommit className="h-3 w-3 ml-1" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProjectSelectionPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project-list-selection"],
    queryFn: getJenkinsProjects,
    retry: false,
    refetchOnWindowFocus: true,
  });

  if (error) throw error;

  const filteredProjects =
    projects === undefined
      ? undefined
      : projects.filter((project) =>
          project.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950">
      {filteredProjects && !isLoading && !error ? (
        <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              <span className="text-platypus font-bold text-2xl">
                {filteredProjects.length}
              </span>{" "}
              Projects
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={`project-selection-card-${index}`}
                project={project}
              />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-zinc-400 mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No projects found</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </div>
            </div>
          )}
        </main>
      ) : (
        <LoadingSpinner />
      )}
    </div>
  );
}
