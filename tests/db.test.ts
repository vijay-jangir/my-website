import { afterEach, describe, expect, it, vi } from "vitest";

const originalDatabaseUrl = process.env.DATABASE_URL;

async function importDrizzleModule() {
  vi.resetModules();
  return import("@/lib/drizzle");
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

describe("lib/drizzle", () => {
  it("returns null from getDrizzleDb when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    const { getDrizzleDb } = await importDrizzleModule();

    expect(getDrizzleDb()).toBeNull();
  });

  it("returns null from dbQuery instead of throwing when no database is configured", async () => {
    delete process.env.DATABASE_URL;

    const { dbQuery } = await importDrizzleModule();

    await expect(dbQuery("select 1")).resolves.toBeNull();
  });
});
