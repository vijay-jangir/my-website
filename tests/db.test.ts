import { afterEach, describe, expect, it, vi } from "vitest";

const originalDatabaseUrl = process.env.DATABASE_URL;

async function importDbModule() {
  vi.resetModules();
  return import("@/lib/db");
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.resetModules();

  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
});

describe("lib/db", () => {
  it("returns null from getDbPool when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    const { getDbPool } = await importDbModule();

    expect(getDbPool()).toBeNull();
  });

  it("returns null from dbQuery instead of throwing when no pool is configured", async () => {
    delete process.env.DATABASE_URL;

    const { dbQuery } = await importDbModule();

    await expect(dbQuery("select 1")).resolves.toBeNull();
  });
});
