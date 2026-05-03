import { getDb } from "./connection";
import { notices } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { InsertNotice } from "@db/schema";

export async function findAllNotices(status?: string) {
  const db = getDb();
  const conditions = [];
  
  if (status && status !== "all") {
    conditions.push(eq(notices.priority, status as any));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  return db.query.notices.findMany({
    where: whereClause,
    with: {
      targetRoom: true,
      targetTenant: true,
    },
    orderBy: desc(notices.createdAt),
  });
}

export async function findNoticeById(id: number) {
  return getDb().query.notices.findFirst({
    where: eq(notices.id, id),
    with: {
      targetRoom: true,
      targetTenant: true,
    },
  });
}

export async function createNotice(data: InsertNotice) {
  const db = getDb();
  const [{ id }] = await db.insert(notices).values(data).$returningId();
  return db.query.notices.findFirst({ 
    where: eq(notices.id, id),
    with: { targetRoom: true, targetTenant: true }
  });
}

export async function updateNotice(id: number, data: Partial<InsertNotice>) {
  const db = getDb();
  await db.update(notices).set(data).where(eq(notices.id, id));
  return db.query.notices.findFirst({ 
    where: eq(notices.id, id),
    with: { targetRoom: true, targetTenant: true }
  });
}

export async function deleteNotice(id: number) {
  return getDb().delete(notices).where(eq(notices.id, id));
}
