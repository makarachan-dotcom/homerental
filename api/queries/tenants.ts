import { getDb } from "./connection";
import { tenants } from "@db/schema";
import { eq, and, sql, desc, count } from "drizzle-orm";
import type { InsertTenant } from "@db/schema";

export async function findAllTenants(search?: string, status?: string) {
  const db = getDb();
  const conditions = [];
  
  if (search) {
    conditions.push(
      sql`${tenants.fullNameKh} LIKE ${`%${search}%`} OR ${tenants.phoneNumber} LIKE ${`%${search}%`} OR ${tenants.idCardNumber} LIKE ${`%${search}%`}`
    );
  }
  if (status && status !== "all") {
    conditions.push(eq(tenants.status, status as any));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  return db.query.tenants.findMany({
    where: whereClause,
    with: {
      room: true,
    },
    orderBy: desc(tenants.createdAt),
  });
}

export async function findTenantById(id: number) {
  return getDb().query.tenants.findFirst({
    where: eq(tenants.id, id),
    with: {
      room: true,
      contracts: true,
      payments: {
        orderBy: desc(tenants.createdAt),
        limit: 10,
      },
    },
  });
}

export async function findTenantByRoomId(roomId: number) {
  return getDb().query.tenants.findMany({
    where: eq(tenants.roomId, roomId),
    with: {
      room: true,
    },
  });
}

export async function createTenant(data: InsertTenant) {
  const db = getDb();
  const [{ id }] = await db.insert(tenants).values(data).$returningId();
  return db.query.tenants.findFirst({ 
    where: eq(tenants.id, id),
    with: { room: true }
  });
}

export async function updateTenant(id: number, data: Partial<InsertTenant>) {
  const db = getDb();
  await db.update(tenants).set(data).where(eq(tenants.id, id));
  return db.query.tenants.findFirst({ 
    where: eq(tenants.id, id),
    with: { room: true }
  });
}

export async function deleteTenant(id: number) {
  return getDb().delete(tenants).where(eq(tenants.id, id));
}

export async function getTenantStats() {
  const db = getDb();
  const total = await db.select({ count: count() }).from(tenants);
  const active = await db.select({ count: count() }).from(tenants).where(eq(tenants.status, "active"));
  const inactive = await db.select({ count: count() }).from(tenants).where(eq(tenants.status, "inactive"));
  const blacklisted = await db.select({ count: count() }).from(tenants).where(eq(tenants.status, "blacklisted"));
  
  return {
    total: total[0]?.count ?? 0,
    active: active[0]?.count ?? 0,
    inactive: inactive[0]?.count ?? 0,
    blacklisted: blacklisted[0]?.count ?? 0,
  };
}
