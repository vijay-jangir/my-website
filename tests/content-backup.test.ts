import { afterEach, describe, expect, it, vi } from "vitest";

import { fallbackPortfolioSnapshot } from "@/content/portfolio";

const BACKUP_ENV_KEYS = [
  "CONTENT_BACKUP_REPO",
  "CONTENT_BACKUP_PAT",
  "CONTENT_BACKUP_BRANCH",
] as const;

type BackupEnvKey = (typeof BACKUP_ENV_KEYS)[number];
type BackupEnvOverrides = Partial<Record<BackupEnvKey, string | undefined>>;

const originalEnv = new Map<BackupEnvKey, string | undefined>(
  BACKUP_ENV_KEYS.map((key) => [key, process.env[key]]),
);

function restoreBackupEnv() {
  for (const key of BACKUP_ENV_KEYS) {
    const value = originalEnv.get(key);

    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function setBackupEnv(overrides: BackupEnvOverrides) {
  for (const key of BACKUP_ENV_KEYS) {
    delete process.env[key];
  }

  for (const key of BACKUP_ENV_KEYS) {
    const value = overrides[key];

    if (value !== undefined) {
      process.env[key] = value;
    }
  }
}

async function importContentBackupModule() {
  vi.resetModules();
  return import("@/lib/content-backup");
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function createFetchMock() {
  const fetchMock = vi.fn<typeof fetch>();
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function installTimeoutSpy() {
  const signals: AbortSignal[] = [];
  const timeoutSpy = vi.spyOn(AbortSignal, "timeout").mockImplementation(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    signals.push(signal);
    return signal;
  });

  return { signals, timeoutSpy };
}

function readHeader(init: RequestInit | undefined, name: string) {
  return new Headers(init?.headers).get(name);
}

function parseJsonBody(init: RequestInit | undefined) {
  const body = init?.body;

  if (typeof body !== "string") {
    throw new TypeError("Expected a JSON string body.");
  }

  const parsed: unknown = JSON.parse(body);
  return parsed;
}

function expectAllFetchCallsUseTimeout(
  fetchMock: ReturnType<typeof createFetchMock>,
  timeoutState: ReturnType<typeof installTimeoutSpy>,
) {
  expect(timeoutState.timeoutSpy).toHaveBeenCalledTimes(
    fetchMock.mock.calls.length,
  );

  for (const [index, [, init]] of fetchMock.mock.calls.entries()) {
    expect(timeoutState.timeoutSpy).toHaveBeenNthCalledWith(index + 1, 8000);
    expect(init?.signal).toBe(timeoutState.signals[index]);
  }
}

function expectNoFetchCallUsesTimeout(
  fetchMock: ReturnType<typeof createFetchMock>,
) {
  // NOTE: githubRequest() currently lacks AbortSignal.timeout — to be fixed in Phase 2
  for (const [, init] of fetchMock.mock.calls) {
    expect(init?.signal).toBeUndefined();
  }
}

afterEach(() => {
  restoreBackupEnv();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.resetModules();
});

describe("content backup", () => {
  it("builds the raw state URL from owner/repo and the default content-backup branch", async () => {
    setBackupEnv({
      CONTENT_BACKUP_PAT: "test-pat",
      CONTENT_BACKUP_REPO: "octocat/portfolio-backups",
    });

    const fetchMock = createFetchMock();
    const timeoutState = installTimeoutSpy();

    fetchMock.mockResolvedValueOnce(
      jsonResponse({ siteProfile: { name: "Vijay" } }),
    );

    const { getBackupRawUrl, loadBackupSnapshot } =
      await importContentBackupModule();

    expect(getBackupRawUrl("state/current.json")).toBe(
      "https://raw.githubusercontent.com/octocat/portfolio-backups/content-backup/state/current.json",
    );

    await expect(loadBackupSnapshot()).resolves.toEqual({
      siteProfile: { name: "Vijay" },
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];

    expect(url).toBe(
      "https://raw.githubusercontent.com/octocat/portfolio-backups/content-backup/state/current.json",
    );
    expect(readHeader(init, "Accept")).toBe("application/json");
    expectAllFetchCallsUseTimeout(fetchMock, timeoutState);
  });

  it("sends GitHub API requests with the parsed owner/repo, bearer auth, base64 content, and existing sha", async () => {
    setBackupEnv({
      CONTENT_BACKUP_BRANCH: "preview-backups",
      CONTENT_BACKUP_PAT: "ghp_test_pat",
      CONTENT_BACKUP_REPO: "octocat/portfolio-backups",
    });

    const fetchMock = createFetchMock();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ object: { sha: "branch-sha" } }))
      .mockResolvedValueOnce(jsonResponse({ sha: "existing-file-sha" }))
      .mockResolvedValueOnce(
        jsonResponse({
          commit: { sha: "commit-sha" },
          content: { path: "state/current.json" },
        }),
      );

    const { putBackupFile } = await importContentBackupModule();
    const result = await putBackupFile({
      content: "hello backup",
      message: "Update backup",
      path: "state/current.json",
    });

    expect(result).toEqual({
      commitSha: "commit-sha",
      path: "state/current.json",
      sha: "existing-file-sha",
      url: "https://raw.githubusercontent.com/octocat/portfolio-backups/preview-backups/state/current.json",
    });

    const [branchUrl, branchInit] = fetchMock.mock.calls[0] ?? [];
    const [existingUrl] = fetchMock.mock.calls[1] ?? [];
    const [, putInit] = fetchMock.mock.calls[2] ?? [];

    expect(branchUrl).toBe(
      "https://api.github.com/repos/octocat/portfolio-backups/git/ref/heads/preview-backups",
    );
    expect(existingUrl).toBe(
      "https://api.github.com/repos/octocat/portfolio-backups/contents/state/current.json?ref=preview-backups",
    );
    expect(readHeader(branchInit, "Authorization")).toBe("Bearer ghp_test_pat");
    expect(readHeader(branchInit, "Accept")).toBe(
      "application/vnd.github+json",
    );
    expect(readHeader(branchInit, "User-Agent")).toBe("vijayjangir.com");
    expect(parseJsonBody(putInit)).toMatchObject({
      branch: "preview-backups",
      content: Buffer.from("hello backup", "utf8").toString("base64"),
      message: "Update backup",
      sha: "existing-file-sha",
    });
    expectNoFetchCallUsesTimeout(fetchMock);
  });

  it("creates the backup branch from the repository default branch when the branch is absent", async () => {
    setBackupEnv({
      CONTENT_BACKUP_BRANCH: "preview-backups",
      CONTENT_BACKUP_PAT: "ghp_test_pat",
      CONTENT_BACKUP_REPO: "octocat/portfolio-backups",
    });

    const fetchMock = createFetchMock();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, { status: 404 }))
      .mockResolvedValueOnce(jsonResponse({ default_branch: "main" }))
      .mockResolvedValueOnce(jsonResponse({ object: { sha: "base-ref-sha" } }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 201 }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 404 }))
      .mockResolvedValueOnce(
        jsonResponse({
          commit: { sha: "commit-sha" },
          content: {
            path: "state/current.json",
            sha: "new-file-sha",
          },
        }),
      );

    const { putBackupFile } = await importContentBackupModule();
    const result = await putBackupFile({
      content: "{}",
      message: "Create backup state",
      path: "state/current.json",
    });

    expect(result).toEqual({
      commitSha: "commit-sha",
      path: "state/current.json",
      sha: "new-file-sha",
      url: "https://raw.githubusercontent.com/octocat/portfolio-backups/preview-backups/state/current.json",
    });

    const [repoUrl] = fetchMock.mock.calls[1] ?? [];
    const [baseRefUrl] = fetchMock.mock.calls[2] ?? [];
    const [createBranchUrl, createBranchInit] = fetchMock.mock.calls[3] ?? [];
    const [, putInit] = fetchMock.mock.calls[5] ?? [];

    expect(repoUrl).toBe(
      "https://api.github.com/repos/octocat/portfolio-backups",
    );
    expect(baseRefUrl).toBe(
      "https://api.github.com/repos/octocat/portfolio-backups/git/ref/heads/main",
    );
    expect(createBranchUrl).toBe(
      "https://api.github.com/repos/octocat/portfolio-backups/git/refs",
    );
    expect(parseJsonBody(createBranchInit)).toEqual({
      ref: "refs/heads/preview-backups",
      sha: "base-ref-sha",
    });
    expect(parseJsonBody(putInit)).toMatchObject({
      branch: "preview-backups",
      content: Buffer.from("{}", "utf8").toString("base64"),
      message: "Create backup state",
    });
    expect(parseJsonBody(putInit)).not.toHaveProperty("sha");
    expectNoFetchCallUsesTimeout(fetchMock);
  });

  it("writes the current state and a timestamped snapshot path", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-07T12:34:56.789Z"));

    setBackupEnv({
      CONTENT_BACKUP_PAT: "ghp_test_pat",
      CONTENT_BACKUP_REPO: "octocat/portfolio-backups",
    });

    const fetchMock = createFetchMock();
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ object: { sha: "branch-sha" } }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 404 }))
      .mockResolvedValueOnce(
        jsonResponse({
          commit: { sha: "current-commit-sha" },
          content: {
            path: "state/current.json",
            sha: "current-content-sha",
          },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ object: { sha: "branch-sha" } }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 404 }))
      .mockResolvedValueOnce(
        jsonResponse({
          commit: { sha: "snapshot-commit-sha" },
          content: {
            path: "snapshots/2026/09/2026-09-07T12-34-56.789Z.json",
            sha: "snapshot-content-sha",
          },
        }),
      );

    const { writeSnapshotToBackup } = await importContentBackupModule();
    const result = await writeSnapshotToBackup({
      actor: "vijay",
      snapshot: fallbackPortfolioSnapshot,
      summary: "manual publish",
    });

    expect(result).toEqual({
      backupRepo: "octocat/portfolio-backups",
      branch: "content-backup",
      commitSha: "snapshot-commit-sha",
      currentPath: "state/current.json",
      snapshotPath: "snapshots/2026/09/2026-09-07T12-34-56.789Z.json",
    });

    const [currentPutUrl, currentPutInit] = fetchMock.mock.calls[2] ?? [];
    const [snapshotPutUrl, snapshotPutInit] = fetchMock.mock.calls[5] ?? [];
    const payload = `${JSON.stringify(fallbackPortfolioSnapshot, null, 2)}\n`;
    const encodedPayload = Buffer.from(payload, "utf8").toString("base64");

    expect(currentPutUrl).toBe(
      "https://api.github.com/repos/octocat/portfolio-backups/contents/state/current.json",
    );
    expect(snapshotPutUrl).toBe(
      "https://api.github.com/repos/octocat/portfolio-backups/contents/snapshots/2026/09/2026-09-07T12-34-56.789Z.json",
    );
    expect(parseJsonBody(currentPutInit)).toMatchObject({
      branch: "content-backup",
      content: encodedPayload,
      message: "Update portfolio state by vijay: manual publish",
    });
    expect(parseJsonBody(snapshotPutInit)).toMatchObject({
      branch: "content-backup",
      content: encodedPayload,
      message: "Snapshot portfolio state by vijay: manual publish",
    });
    expectNoFetchCallUsesTimeout(fetchMock);
  });

  it("returns null and logs a warning when the raw snapshot fetch fails", async () => {
    setBackupEnv({
      CONTENT_BACKUP_PAT: "ghp_test_pat",
      CONTENT_BACKUP_REPO: "octocat/portfolio-backups",
    });

    const fetchMock = createFetchMock();
    const timeoutState = installTimeoutSpy();
    const warning = new Error("network down");
    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => undefined);

    fetchMock.mockRejectedValueOnce(warning);

    const { loadBackupSnapshot } = await importContentBackupModule();

    await expect(loadBackupSnapshot()).resolves.toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      "[content-backup] fallback snapshot fetch failed:",
      warning,
    );
    expectAllFetchCallsUseTimeout(fetchMock, timeoutState);
  });
});
