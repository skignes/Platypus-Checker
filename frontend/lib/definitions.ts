export type JenkinsBuildInfo = {
  url: string;
  number: number;
};

export type JenkinsJob = {
  name: string;
  url: string;
};

export type JenkinsJobList = {
  jobs: JenkinsJob[];
  displayName: string;
};

export type JenkinsProject = {
  builds: JenkinsBuildInfo[];
  buildable: boolean;
  displayName: string;
  fullName: string;
  lastBuild: { url: string; number: number } | null;
};

export type ProjectPreview = {
  build: ProjectBuild | DeliveryError;
  displayName: string;
  projectUrl: string;
};

export type Role = "admin" | string;

export type Roles = Role | Role[];

export type JenkinsTestResult = {
  name: string; // "section-name:test-name"
  duration: number;
  errorDetails: string | null;
  skipped: boolean;
  skippedMessage: string | null;
  status: "PASSED" | "FAILED" | "REGRESSION" | "FIXED" | "SKIPPED";
};

export type JenkinsTestSuit = {
  name: string;
  timestamp: string;
  duration: number;
  cases: JenkinsTestResult[];
};

export type JenkinsGitInfo = {
  buildsByBranchName: Record<string, { revision: { SHA1: string } }>;
};

export type JenkinsBuildResult = {
  statusCode: number;
  id: number;
  empty: boolean;
  duration: number;
  failCount: number;
  passCount: number;
  skipCount: number;
  suites: JenkinsTestSuit[];
};

export type ProjectBuild = {
  build: JenkinsBuildResult;
  git: JenkinsGitInfo;
  deliveryError: false;
};

export type DeliveryError = {
  id: number;
  deliveryError: true;
};

export type Section = {
  name: string;
  status: "PASSED" | "FAILED" | "WARNING" | "";
  passRate: number;
  tests: JenkinsTestResult[];
};

export type BuildHistory = (ProjectBuild | DeliveryError)[];
