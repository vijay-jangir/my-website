import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SessionUser } from "@/src/lib/auth";

type MockActionContext = {
  cookies: Record<string, string>;
};

type EnvState = {
  databaseUrl?: string;
  contentBackupPat?: string;
  contentBackupRepo?: string;
};

const expectedActionNames = [
  "upsertProfile",
  "createSkill",
  "updateSkill",
  "deleteSkill",
  "createProject",
  "updateProject",
  "deleteProject",
  "createExperience",
  "updateExperience",
  "deleteExperience",
  "publishContentSnapshot",
  "uploadMedia",
  "listRevisions",
] as const;

type ExpectedActionName = (typeof expectedActionNames)[number];

type MockActionErrorOptions = {
  code: string;
  message?: string;
};

class MockActionError extends Error {
  readonly code: string;

  constructor(options: MockActionErrorOptions) {
    super(options.message ?? options.code);
    this.code = options.code;
    this.name = "ActionError";
  }
}

type MockActionFactoryInput = {
  handler: (
    input: unknown,
    context: MockActionContext,
  ) => Promise<unknown> | unknown;
};

type MockActionClient = ((
  input?: unknown,
) => Promise<{ data: unknown; error?: unknown }>) & {
  orThrow: (input?: unknown) => Promise<unknown>;
  queryString: string;
};

const mockState: {
  currentContext: MockActionContext;
  currentSession: SessionUser | null;
  envState: EnvState;
} = {
  currentContext: { cookies: {} },
  currentSession: null,
  envState: {},
};

const getSessionUserMock = vi.fn(async () => mockState.currentSession);
const getPortfolioContentMock = vi.fn(async () => ({ source: "content" }));
const listContentRevisionsMock = vi.fn(async () => []);
const publishPortfolioSnapshotMock = vi.fn(async () => ({ revisions: [] }));
const putBackupFileMock = vi.fn(async () => ({ path: "mock/path" }));
const upsertProfileMock = vi.fn((snapshot: unknown) => snapshot);
const upsertSkillMock = vi.fn((snapshot: unknown) => snapshot);
const deleteSkillMock = vi.fn((snapshot: unknown) => snapshot);
const upsertProjectMock = vi.fn((snapshot: unknown) => snapshot);
const deleteProjectMock = vi.fn((snapshot: unknown) => snapshot);
const upsertExperienceMock = vi.fn((snapshot: unknown) => snapshot);
const deleteExperienceMock = vi.fn((snapshot: unknown) => snapshot);
const appendMediaAssetMock = vi.fn((snapshot: unknown) => snapshot);
const publishAdvancedCollectionsMock = vi.fn((snapshot: unknown) => snapshot);

const originalNodeEnv = process.env.NODE_ENV;

function buildAuthorizedEnv(overrides: Partial<EnvState> = {}): EnvState {
  return {
    databaseUrl: "postgres://user:pass@db.example.com:5432/test",
    contentBackupPat: "backup-pat",
    contentBackupRepo: "owner/repo",
    ...overrides,
  };
}

function resetMockState() {
  mockState.currentContext = { cookies: {} };
  mockState.currentSession = null;
  mockState.envState = buildAuthorizedEnv();
}

function resetDependencyMocks() {
  getSessionUserMock.mockClear();
  getPortfolioContentMock.mockClear();
  listContentRevisionsMock.mockClear();
  publishPortfolioSnapshotMock.mockClear();
  putBackupFileMock.mockClear();
  upsertProfileMock.mockClear();
  upsertSkillMock.mockClear();
  deleteSkillMock.mockClear();
  upsertProjectMock.mockClear();
  deleteProjectMock.mockClear();
  upsertExperienceMock.mockClear();
  deleteExperienceMock.mockClear();
  appendMediaAssetMock.mockClear();
  publishAdvancedCollectionsMock.mockClear();
}

function assertNoDownstreamCalls() {
  expect(getPortfolioContentMock).not.toHaveBeenCalled();
  expect(listContentRevisionsMock).not.toHaveBeenCalled();
  expect(publishPortfolioSnapshotMock).not.toHaveBeenCalled();
  expect(putBackupFileMock).not.toHaveBeenCalled();
  expect(upsertProfileMock).not.toHaveBeenCalled();
  expect(upsertSkillMock).not.toHaveBeenCalled();
  expect(deleteSkillMock).not.toHaveBeenCalled();
  expect(upsertProjectMock).not.toHaveBeenCalled();
  expect(deleteProjectMock).not.toHaveBeenCalled();
  expect(upsertExperienceMock).not.toHaveBeenCalled();
  expect(deleteExperienceMock).not.toHaveBeenCalled();
  expect(appendMediaAssetMock).not.toHaveBeenCalled();
  expect(publishAdvancedCollectionsMock).not.toHaveBeenCalled();
}

function createActionClient({
  handler,
}: MockActionFactoryInput): MockActionClient {
  const action = (async (input?: unknown) => {
    try {
      return {
        data: await handler(input, mockState.currentContext),
      };
    } catch (error) {
      return {
        data: undefined,
        error,
      };
    }
  }) as MockActionClient;

  action.orThrow = async (input?: unknown) =>
    handler(input, mockState.currentContext);
  action.queryString = "";

  return action;
}

async function loadServer() {
  vi.resetModules();

  vi.doMock("astro:actions", () => ({
    ActionError: MockActionError,
    defineAction: createActionClient,
  }));

  vi.doMock("@/src/lib/auth", () => ({
    getSessionUser: getSessionUserMock,
  }));

  vi.doMock("@/lib/env", () => ({
    isDatabaseConfigured: vi.fn(() => Boolean(mockState.envState.databaseUrl)),
    isContentBackupConfigured: vi.fn(() =>
      Boolean(
        mockState.envState.contentBackupRepo &&
        mockState.envState.contentBackupPat,
      ),
    ),
  }));

  vi.doMock("@/lib/portfolio-content", () => ({
    getPortfolioContent: getPortfolioContentMock,
    listContentRevisions: listContentRevisionsMock,
    publishPortfolioSnapshot: publishPortfolioSnapshotMock,
  }));

  vi.doMock("@/lib/content-backup", () => ({
    putBackupFile: putBackupFileMock,
  }));

  vi.doMock("@/lib/portfolio-admin", () => ({
    appendMediaAsset: appendMediaAssetMock,
    deleteExperience: deleteExperienceMock,
    deleteProject: deleteProjectMock,
    deleteSkill: deleteSkillMock,
    publishAdvancedCollections: publishAdvancedCollectionsMock,
    upsertExperience: upsertExperienceMock,
    upsertProfile: upsertProfileMock,
    upsertProject: upsertProjectMock,
    upsertSkill: upsertSkillMock,
  }));

  return import("@/src/actions/index");
}

function buildInput(actionName: ExpectedActionName) {
  switch (actionName) {
    case "upsertProfile":
      return {
        contentPromise: "Keep the focus sharp.",
        currentFocusLabels: ["AI"],
        email: "vijay@example.com",
        githubUrl: "https://github.com/vijayjangir",
        heroLabel: "Platform engineering",
        lastUpdatedLabel: "September 2026",
        linkedinUrl: "https://www.linkedin.com/in/vijayjangir/",
        location: "Bengaluru, India",
        name: "Vijay Jangir",
        overview: ["Builds reliable data and AI platforms."],
        profileImageUrl: "https://example.com/avatar.png",
        recruiterPitch: "Backend and platform engineer",
        timezone: "IST",
        title: "Senior Platform Engineer",
      };
    case "createSkill":
    case "updateSkill":
      return {
        aliases: ["TypeScript"],
        category: "language",
        focusWeights: {},
        id: "typescript",
        label: "TypeScript",
      };
    case "deleteSkill":
      return { id: "typescript" };
    case "createProject":
    case "updateProject":
      return {
        caseStudy: undefined,
        detail: "Built a resilient platform.",
        featured: true,
        focusWeights: {},
        id: "proj-1",
        impact: "Improved delivery speed.",
        proofLinks: [],
        publicProof: undefined,
        skillIds: [],
        slug: "proj-1",
        summary: "Platform modernization",
        title: "Platform modernization",
        visibility: "public",
      };
    case "deleteProject":
      return { id: "proj-1" };
    case "createExperience":
    case "updateExperience":
      return {
        bullets: [],
        company: "Example Corp",
        companyUrl: "https://example.com",
        date: "2024",
        description: "Led platform work.",
        focusWeights: {},
        icon: "briefcase",
        id: "exp-1",
        title: "Staff Engineer",
        type: "employment",
      };
    case "deleteExperience":
      return { id: "exp-1" };
    case "publishContentSnapshot":
      return {
        focusDefinitions: [],
        profileHighlights: [],
        summary: "Publish latest content",
        summaryTemplates: [],
      };
    case "uploadMedia": {
      const formData = new FormData();
      formData.set("entityId", "proj-1");
      formData.set("entityType", "project");
      formData.set(
        "file",
        new Blob(["image-data"], { type: "image/png" }),
        "proof.png",
      );
      formData.set("kind", "image");
      formData.set("label", "Proof");
      return formData;
    }
    case "listRevisions":
      return undefined;
  }
}

async function expectActionToRejectWithUnauthorized(
  actionName: ExpectedActionName,
) {
  const { server } = await loadServer();
  const action = Reflect.get(server, actionName);

  await expect(action.orThrow(buildInput(actionName))).rejects.toMatchObject({
    code: "UNAUTHORIZED",
    message: "Owner authentication is required.",
  });

  expect(getSessionUserMock).toHaveBeenCalledTimes(1);
  assertNoDownstreamCalls();
}

describe("content actions authorization", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    resetMockState();
    resetDependencyMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("fails loudly if the action export list changes", async () => {
    const { server } = await loadServer();

    expect(Object.keys(server).sort()).toEqual([...expectedActionNames].sort());
  });

  it("rejects when no admin session is present", async () => {
    const { server } = await loadServer();

    await expect(server.listRevisions.orThrow()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "Owner authentication is required.",
    });

    expect(getSessionUserMock).toHaveBeenCalledTimes(1);
    assertNoDownstreamCalls();
  });

  it("rejects when the session role is not owner", async () => {
    mockState.currentSession = {
      login: "some-user",
      role: "intruder" as SessionUser["role"],
    };

    const { server } = await loadServer();

    await expect(server.listRevisions.orThrow()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      message: "Owner authentication is required.",
    });

    expect(getSessionUserMock).toHaveBeenCalledTimes(1);
    assertNoDownstreamCalls();
  });

  it("rejects when the backup repo is missing", async () => {
    mockState.currentSession = {
      login: "admin-user",
      role: "owner" as SessionUser["role"],
    };
    mockState.envState = buildAuthorizedEnv({ contentBackupRepo: undefined });

    const { server } = await loadServer();

    await expect(server.listRevisions.orThrow()).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message:
        "CONTENT_BACKUP_REPO and CONTENT_BACKUP_PAT must be configured before content publishing is enabled.",
    });

    expect(getSessionUserMock).toHaveBeenCalledTimes(1);
    assertNoDownstreamCalls();
  });

  it("rejects when the backup PAT is missing", async () => {
    mockState.currentSession = {
      login: "admin-user",
      role: "owner" as SessionUser["role"],
    };
    mockState.envState = buildAuthorizedEnv({ contentBackupPat: undefined });

    const { server } = await loadServer();

    await expect(server.listRevisions.orThrow()).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message:
        "CONTENT_BACKUP_REPO and CONTENT_BACKUP_PAT must be configured before content publishing is enabled.",
    });

    expect(getSessionUserMock).toHaveBeenCalledTimes(1);
    assertNoDownstreamCalls();
  });

  it("rejects in production when DATABASE_URL is missing", async () => {
    process.env.NODE_ENV = "production";
    mockState.currentSession = {
      login: "admin-user",
      role: "owner" as SessionUser["role"],
    };
    mockState.envState = buildAuthorizedEnv({
      databaseUrl: undefined,
    });

    const { server } = await loadServer();

    await expect(server.listRevisions.orThrow()).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
      message:
        "DATABASE_URL must be configured before production content publishing is enabled.",
    });

    expect(getSessionUserMock).toHaveBeenCalledTimes(1);
    assertNoDownstreamCalls();
  });

  it("does not require DATABASE_URL outside production", async () => {
    process.env.NODE_ENV = "development";
    mockState.currentSession = {
      login: "admin-user",
      role: "owner" as SessionUser["role"],
    };
    mockState.envState = buildAuthorizedEnv({
      databaseUrl: undefined,
    });
    listContentRevisionsMock.mockResolvedValueOnce([{ id: "rev-1" }]);

    const { server } = await loadServer();

    await expect(server.listRevisions.orThrow()).resolves.toEqual({
      revisions: [{ id: "rev-1" }],
    });

    expect(getSessionUserMock).toHaveBeenCalledTimes(1);
    expect(listContentRevisionsMock).toHaveBeenCalledTimes(1);
  });

  it("checks admin auth before any downstream work for all 13 actions", async () => {
    for (const actionName of expectedActionNames) {
      resetDependencyMocks();
      await expectActionToRejectWithUnauthorized(actionName);
    }
  });
});
