import { env, isContentBackupConfigured } from "@/lib/env";
import type { PortfolioSnapshot } from "@/lib/portfolio-types";

const GITHUB_API = "https://api.github.com";

type GitHubRepoInfo = {
  default_branch: string;
};

type GitHubRefResponse = {
  object: {
    sha: string;
  };
};

type GitHubContentResponse = {
  sha: string;
};

type GitHubPutContentResponse = {
  commit?: {
    sha?: string;
  };
  content?: {
    path?: string;
    sha?: string;
  };
};

function parseRepoSlug(repoSlug: string) {
  const [owner, repo] = repoSlug.split("/");

  if (!owner || !repo) {
    throw new Error("CONTENT_BACKUP_REPO must use the form owner/repo.");
  }

  return { owner, repo };
}

function getBackupRepo() {
  if (!env.contentBackupRepo || !env.contentBackupPat) {
    throw new Error("Backup repository configuration is missing.");
  }

  return {
    ...parseRepoSlug(env.contentBackupRepo),
    branch: env.contentBackupBranch,
    pat: env.contentBackupPat,
    repoSlug: env.contentBackupRepo,
  };
}

async function githubRequest<T>(path: string, init: RequestInit = {}) {
  const repo = getBackupRepo();
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${repo.pat}`,
      "Content-Type": "application/json",
      "User-Agent": "vijayjangir.com",
      ...(init.headers ?? {}),
    },
  });

  return response as Response & { json(): Promise<T> };
}

async function ensureBackupBranch() {
  const repo = getBackupRepo();
  const branchPath = `/repos/${repo.owner}/${repo.repo}/git/ref/heads/${repo.branch}`;
  const branchResponse = await githubRequest<GitHubRefResponse>(branchPath);

  if (branchResponse.ok) {
    return;
  }

  if (branchResponse.status !== 404) {
    throw new Error("Unable to read backup branch state from GitHub.");
  }

  const repoResponse = await githubRequest<GitHubRepoInfo>(
    `/repos/${repo.owner}/${repo.repo}`,
  );

  if (!repoResponse.ok) {
    throw new Error("Unable to read backup repository metadata from GitHub.");
  }

  const repoPayload = await repoResponse.json();
  const baseRefResponse = await githubRequest<GitHubRefResponse>(
    `/repos/${repo.owner}/${repo.repo}/git/ref/heads/${repoPayload.default_branch}`,
  );

  if (!baseRefResponse.ok) {
    throw new Error("Unable to read default branch ref from GitHub.");
  }

  const baseRef = await baseRefResponse.json();
  const createBranchResponse = await githubRequest(
    `/repos/${repo.owner}/${repo.repo}/git/refs`,
    {
      body: JSON.stringify({
        ref: `refs/heads/${repo.branch}`,
        sha: baseRef.object.sha,
      }),
      method: "POST",
    },
  );

  if (!createBranchResponse.ok) {
    throw new Error("Unable to create the backup branch on GitHub.");
  }
}

async function getExistingFileSha(path: string) {
  const repo = getBackupRepo();
  const response = await githubRequest<GitHubContentResponse>(
    `/repos/${repo.owner}/${repo.repo}/contents/${path}?ref=${repo.branch}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to read existing backup file: ${path}`);
  }

  const payload = await response.json();
  return payload.sha ?? null;
}

function encodeContent(value: Uint8Array | string) {
  const buffer =
    typeof value === "string" ? Buffer.from(value, "utf8") : Buffer.from(value);
  return buffer.toString("base64");
}

export function getBackupRawUrl(path: string) {
  if (!env.contentBackupRepo) {
    return null;
  }

  const repo = parseRepoSlug(env.contentBackupRepo);
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${env.contentBackupBranch}/${path}`;
}

export async function loadBackupSnapshot(): Promise<PortfolioSnapshot | null> {
  const currentUrl = getBackupRawUrl("state/current.json");

  if (!currentUrl) {
    return null;
  }

  try {
    const response = await fetch(currentUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PortfolioSnapshot;
  } catch {
    return null;
  }
}

export async function putBackupFile(options: {
  content: Uint8Array | string;
  message: string;
  path: string;
}) {
  if (!isContentBackupConfigured()) {
    throw new Error("GitHub backup is not configured.");
  }

  const repo = getBackupRepo();
  await ensureBackupBranch();
  const sha = await getExistingFileSha(options.path);
  const response = await githubRequest<GitHubPutContentResponse>(
    `/repos/${repo.owner}/${repo.repo}/contents/${options.path}`,
    {
      body: JSON.stringify({
        branch: repo.branch,
        content: encodeContent(options.content),
        message: options.message,
        ...(sha ? { sha } : {}),
      }),
      method: "PUT",
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to write backup file: ${options.path}`);
  }

  const payload = await response.json();

  return {
    commitSha: payload.commit?.sha ?? null,
    path: payload.content?.path ?? options.path,
    sha: payload.content?.sha ?? sha,
    url: getBackupRawUrl(payload.content?.path ?? options.path),
  };
}

function buildSnapshotPaths(timestamp: string) {
  const [year, month] = timestamp.split("-");
  return {
    currentPath: "state/current.json",
    snapshotPath: `snapshots/${year}/${month}/${timestamp}.json`,
  };
}

export function createSnapshotTimestamp() {
  return new Date().toISOString().replaceAll(":", "-");
}

export async function writeSnapshotToBackup(options: {
  actor: string;
  snapshot: PortfolioSnapshot;
  summary?: string;
}) {
  const timestamp = createSnapshotTimestamp();
  const paths = buildSnapshotPaths(timestamp);
  const messageSummary = options.summary ? `: ${options.summary}` : "";
  const payload = `${JSON.stringify(options.snapshot, null, 2)}\n`;

  const current = await putBackupFile({
    content: payload,
    message: `Update portfolio state by ${options.actor}${messageSummary}`,
    path: paths.currentPath,
  });
  const snapshot = await putBackupFile({
    content: payload,
    message: `Snapshot portfolio state by ${options.actor}${messageSummary}`,
    path: paths.snapshotPath,
  });

  return {
    backupRepo: getBackupRepo().repoSlug,
    branch: getBackupRepo().branch,
    commitSha: snapshot.commitSha ?? current.commitSha ?? undefined,
    currentPath: current.path,
    snapshotPath: snapshot.path,
  };
}
