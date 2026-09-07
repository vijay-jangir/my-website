import { dbQuery } from "@/lib/drizzle";

type PurgeResult = { deletedCount: number };

export async function purgeExpiredVariants(): Promise<PurgeResult> {
  const result = await dbQuery<{ count: string }>(
    `
      with deleted as (
        delete from resume_variants
        where expires_at < now()
        returning 1
      )
      select count(*)::text as count from deleted
    `,
  );

  const deletedCount = Number(result?.rows[0]?.count ?? 0);

  if (deletedCount > 0) {
    console.info(
      `[resume-purge] purged ${String(deletedCount)} expired resume variants`,
    );
  }

  return { deletedCount };
}

export async function purgeExpiredJdRequests(): Promise<PurgeResult> {
  const result = await dbQuery<{ count: string }>(
    `
      with deleted as (
        delete from jd_requests
        where expires_at < now()
        returning 1
      )
      select count(*)::text as count from deleted
    `,
  );

  const deletedCount = Number(result?.rows[0]?.count ?? 0);

  if (deletedCount > 0) {
    console.info(
      `[resume-purge] purged ${String(deletedCount)} expired JD requests`,
    );
  }

  return { deletedCount };
}
