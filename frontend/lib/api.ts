"use server";

import {
  JENKINS_URL,
  JENKINS_USER,
  JENKINS_API_KEY,
  PUBLIC_JENKINS_URL,
} from "@/lib/constants";
import {
  BuildHistory,
  DeliveryError,
  JenkinsBuildResult,
  JenkinsGitInfo,
  JenkinsJobList,
  JenkinsProject,
  ProjectBuild,
  ProjectPreview,
} from "@/lib/definitions";
import { auth } from "@clerk/nextjs/server";
import { Roles } from "@/lib/definitions";

//*********
// CLERK
//*********

export const getRoles = async (): Promise<Roles | undefined> => {
  const { sessionClaims } = await auth();
  // @ts-ignore:
  const roles = sessionClaims?.metadata?.role;
  if (Array.isArray(roles)) return roles.map((r) => r.toLowerCase());
  return roles;
};

async function requestGetServer<T>(url: string): Promise<T | undefined> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${JENKINS_USER}:${JENKINS_API_KEY}`)}`,
      },
    });
    const res = await response.json();
    res.statusCode = response.status;
    return res;
  } catch (error) {
    console.log(error);
  }
}

async function requestPostServer(
  url: string,
  body?: string,
): Promise<number | undefined> {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${JENKINS_USER}:${JENKINS_API_KEY}`)}`,
      },
    });
    return response.status;
  } catch (error) {
    console.log(error);
  }
}

export async function isAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in to use the service");

  const roles = await getRoles();
  if (roles === undefined) throw new Error("You do not have access");

  return Array.isArray(roles) ? roles.includes("admin") : roles === "admin";
}

//*********
// JENKINS
//*********

export async function getBuilds(project: string): Promise<BuildHistory> {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in to use the service");

  const roles = await getRoles();
  if (roles === undefined) throw new Error("You do not have access");

  if (project.length == 0) throw new Error("invalid repository");

  const [folderName, ...rest] = project.split("-");
  const projectName = rest.join("-");

  if (
    (Array.isArray(roles)
      ? !roles.includes(projectName.toLowerCase())
      : projectName !== roles) &&
    (Array.isArray(roles) ? !roles.includes("admin") : roles !== "admin")
  )
    throw new Error("You do not have access to this project");

  const url = `${JENKINS_URL}/job/${folderName}/job/${projectName}/api/json`;

  const jenkinsProject = await requestGetServer<JenkinsProject>(url);
  if (jenkinsProject == undefined) throw new Error("project request failed");

  const builds: BuildHistory = [];

  for (const buildInfo of jenkinsProject.builds) {
    const buildUrl = buildInfo.url.replace(
      "http://localhost:8080",
      JENKINS_URL!,
    );
    const build = await requestGetServer<JenkinsBuildResult>(
      buildUrl + "/testReport/api/json",
    );
    const git = await requestGetServer<JenkinsGitInfo>(
      buildUrl + "/git/api/json", // TODO: check api without /git
    );
    if (build == undefined) {
      builds.push({
        id: buildInfo.number,
        deliveryError: true,
        projectUrl:
          `${JENKINS_URL}/job/${folderName}/job/${projectName}`.replace(
            JENKINS_URL!,
            PUBLIC_JENKINS_URL!,
          ),
      });
      continue;
    }
    if (git == undefined) {
      throw new Error(
        `Git couldn't be retrieved for Build #${buildInfo.number}`,
      );
    } else {
      build.id = buildInfo.number;
      builds.push({
        build,
        git,
        projectUrl:
          `${JENKINS_URL}/job/${folderName}/job/${projectName}`.replace(
            JENKINS_URL!,
            PUBLIC_JENKINS_URL!,
          ),
        deliveryError: false,
      });
    }
  }
  return builds;
}

export async function getSingleBuild(
  project: string,
  id: number,
): Promise<ProjectBuild | DeliveryError> {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in to use the service");

  const roles = await getRoles();
  if (roles === undefined) throw new Error("You do not have access");

  const [folderName, ...rest] = project.split("-");
  const projectName = rest.join("-");

  if (
    (Array.isArray(roles)
      ? !roles.includes(projectName.toLowerCase())
      : projectName !== roles) &&
    (Array.isArray(roles) ? !roles.includes("admin") : roles !== "admin")
  )
    throw new Error("You do not have access to this project");

  const build = await requestGetServer<JenkinsBuildResult>(
    `${JENKINS_URL}/job/${folderName}/job/${projectName}/${id}/testReport/api/json`,
  );

  const git = await requestGetServer<JenkinsGitInfo>(
    `${JENKINS_URL}/job/${folderName}/job/${projectName}/${id}/git/api/json`,
  );
  if (build == undefined) {
    return {
      id: 0,
      deliveryError: true,
      projectUrl: `${JENKINS_URL}/job/${folderName}/job/${projectName}`.replace(
        JENKINS_URL!,
        PUBLIC_JENKINS_URL!,
      ),
    };
  }
  if (git == undefined) throw new Error(`Git couldn't be retrieved for Build`);
  return {
    build,
    git,
    projectUrl: `${JENKINS_URL}/job/${folderName}/job/${projectName}`.replace(
      JENKINS_URL!,
      PUBLIC_JENKINS_URL!,
    ),
    deliveryError: false,
  };
}

export async function getJenkinsProjects(): Promise<ProjectPreview[]> {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in to use the service");

  const roles = await getRoles();
  if (roles === undefined) throw new Error("You do not have access");

  const jobList = await requestGetServer<JenkinsJobList>(
    JENKINS_URL + "/api/json",
  );

  if (jobList === undefined) throw new Error("Could not request jobs");

  const previews: ProjectPreview[] = [];

  for (const job of jobList.jobs) {
    if (job.name.toLowerCase() === "seed") continue;
    const folder = await requestGetServer<JenkinsJobList>(
      (job.url + "/api/json").replace("http://localhost:8080", JENKINS_URL!),
    );
    if (folder === undefined)
      throw new Error("Could not request folder " + job.name);

    for (const folderJob of folder.jobs) {
      const project = await requestGetServer<JenkinsProject>(
        (folderJob.url + "/api/json").replace(
          "http://localhost:8080",
          JENKINS_URL!,
        ),
      );

      if (project === undefined)
        throw new Error("Could not request project " + job.name);
      if (project.lastBuild === null) continue;

      if (
        (Array.isArray(roles)
          ? !roles.includes(project.displayName.toLowerCase())
          : project.displayName !== roles) &&
        (Array.isArray(roles) ? !roles.includes("admin") : roles !== "admin")
      )
        continue;

      previews.push({
        displayName: project.displayName,
        build: await getSingleBuild(
          `${folder.displayName}-${project.displayName}`,
          project.lastBuild.number,
        ),
        projectUrl:
          `/projects/${folder.displayName}-${project.displayName}`.replace(
            JENKINS_URL!,
            PUBLIC_JENKINS_URL!,
          ),
      });
    }
  }

  return previews;
}

export async function runJenkinsJob(folderName: string, projectName: string) {
  const url = `${JENKINS_URL}/job/${folderName}/job/${projectName}/build`;
  await requestPostServer(url, ""); // I assume this request will finish before the job finishes. So we can't know when it does finish. Which means the UI won't be updated automatically, and the user will have to refresh.
}
