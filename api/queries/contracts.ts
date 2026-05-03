import { getDb } from "./connection";
import { contracts } from "@db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import type { InsertContract } from "@db/schema";

export async function findAllContracts(status?: string) {
  const db = getDb();
  const conditions = [];
  
  if (status && status !== "all") {
    conditions.push(eq(contracts.status, status as any));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  return db.query.contracts.findMany({
    where: whereClause,
    with: {
      tenant: true,
      room: true,
    },
    orderBy: desc(contracts.createdAt),
  });
}

export async function findContractById(id: number) {
  return getDb().query.contracts.findFirst({
    where: eq(contracts.id, id),
    with: {
      tenant: true,
      room: true,
      payments: {
        orderBy: desc(contracts.createdAt),
        limit: 12,
      },
    },
  });
}

export async function findContractsByTenantId(tenantId: number) {
  return getDb().query.contracts.findMany({
    where: eq(contracts.tenantId, tenantId),
    with: {
      room: true,
    },
    orderBy: desc(contracts.createdAt),
  });
}

export async function findContractsByRoomId(roomId: number) {
  return getDb().query.contracts.findMany({
    where: eq(contracts.roomId, roomId),
    with: {
      tenant: true,
    },
    orderBy: desc(contracts.createdAt),
  });
}

export async function createContract(data: InsertContract) {
  const db = getDb();
  const [{ id }] = await db.insert(contracts).values(data).$returningId();
  return db.query.contracts.findFirst({ 
    where: eq(contracts.id, id),
    with: { tenant: true, room: true }
  });
}

export async function updateContract(id: number, data: Partial<InsertContract>) {
  const db = getDb();
  await db.update(contracts).set(data).where(eq(contracts.id, id));
  return db.query.contracts.findFirst({ 
    where: eq(contracts.id, id),
    with: { tenant: true, room: true }
  });
}

export async function deleteContract(id: number) {
  return getDb().delete(contracts).where(eq(contracts.id, id));
}

export async function getContractStats() {
  const db = getDb();
  const total = await db.select({ count: count() }).from(contracts);
  const active = await db.select({ count: count() }).from(contracts).where(eq(contracts.status, "active"));
  const expired = await db.select({ count: count() }).from(contracts).where(eq(contracts.status, "expired"));
  const terminated = await db.select({ count: count() }).from(contracts).where(eq(contracts.status, "terminated"));
  
  return {
    total: total[0]?.count ?? 0,
    active: active[0]?.count ?? 0,
    expired: expired[0]?.count ?? 0,
    terminated: terminated[0]?.count ?? 0,
  };
}
