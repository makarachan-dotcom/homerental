import { getDb } from "./connection";
import { payments } from "@db/schema";
import { eq, and, desc, count, sum, gte, lte, sql } from "drizzle-orm";
import type { InsertPayment } from "@db/schema";

export async function findAllPayments(search?: string, status?: string, fromDate?: string, toDate?: string) {
  const db = getDb();
  const conditions = [];
  
  if (search) {
    conditions.push(sql`${payments.paymentNumber} LIKE ${`%${search}%`}`);
  }
  if (status && status !== "all") {
    conditions.push(eq(payments.status, status as any));
  }
  if (fromDate) {
    conditions.push(gte(payments.paymentDate, new Date(fromDate)));
  }
  if (toDate) {
    conditions.push(lte(payments.paymentDate, new Date(toDate)));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  return db.query.payments.findMany({
    where: whereClause,
    with: {
      tenant: true,
      room: true,
    },
    orderBy: desc(payments.paymentDate),
  });
}

export async function findPaymentById(id: number) {
  return getDb().query.payments.findFirst({
    where: eq(payments.id, id),
    with: {
      tenant: true,
      room: true,
      contract: true,
    },
  });
}

export async function findPaymentsByTenantId(tenantId: number) {
  return getDb().query.payments.findMany({
    where: eq(payments.tenantId, tenantId),
    with: {
      room: true,
    },
    orderBy: desc(payments.paymentDate),
  });
}

export async function findPaymentsByRoomId(roomId: number) {
  return getDb().query.payments.findMany({
    where: eq(payments.roomId, roomId),
    with: {
      tenant: true,
    },
    orderBy: desc(payments.paymentDate),
  });
}

export async function createPayment(data: InsertPayment) {
  const db = getDb();
  const [{ id }] = await db.insert(payments).values(data).$returningId();
  return db.query.payments.findFirst({ 
    where: eq(payments.id, id),
    with: { tenant: true, room: true }
  });
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = getDb();
  await db.update(payments).set(data).where(eq(payments.id, id));
  return db.query.payments.findFirst({ 
    where: eq(payments.id, id),
    with: { tenant: true, room: true }
  });
}

export async function deletePayment(id: number) {
  return getDb().delete(payments).where(eq(payments.id, id));
}

export async function getPaymentStats() {
  const db = getDb();
  
  const totalCount = await db.select({ count: count() }).from(payments);
  const paidCount = await db.select({ count: count() }).from(payments).where(eq(payments.status, "paid"));
  const pendingCount = await db.select({ count: count() }).from(payments).where(eq(payments.status, "pending"));
  const overdueCount = await db.select({ count: count() }).from(payments).where(eq(payments.status, "overdue"));
  
  const totalUSD = await db.select({ total: sum(payments.amountUSD) }).from(payments).where(eq(payments.status, "paid"));
  const totalRiel = await db.select({ total: sum(payments.amountRiel) }).from(payments).where(eq(payments.status, "paid"));
  
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const monthlyUSD = await db
    .select({ total: sum(payments.amountUSD) })
    .from(payments)
    .where(and(eq(payments.status, "paid"), gte(payments.paymentDate, currentMonth)));
  const monthlyRiel = await db
    .select({ total: sum(payments.amountRiel) })
    .from(payments)
    .where(and(eq(payments.status, "paid"), gte(payments.paymentDate, currentMonth)));
  
  return {
    total: totalCount[0]?.count ?? 0,
    paid: paidCount[0]?.count ?? 0,
    pending: pendingCount[0]?.count ?? 0,
    overdue: overdueCount[0]?.count ?? 0,
    totalRevenueUSD: Number(totalUSD[0]?.total ?? 0),
    totalRevenueRiel: Number(totalRiel[0]?.total ?? 0),
    monthlyRevenueUSD: Number(monthlyUSD[0]?.total ?? 0),
    monthlyRevenueRiel: Number(monthlyRiel[0]?.total ?? 0),
  };
}

export async function getMonthlyPaymentData(year: number) {
  const db = getDb();
  const results = [];
  
  for (let month = 0; month < 12; month++) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const usdResult = await db
      .select({ total: sum(payments.amountUSD) })
      .from(payments)
      .where(and(
        eq(payments.status, "paid"),
        gte(payments.paymentDate, startDate),
        lte(payments.paymentDate, endDate)
      ));
    
    const rielResult = await db
      .select({ total: sum(payments.amountRiel) })
      .from(payments)
      .where(and(
        eq(payments.status, "paid"),
        gte(payments.paymentDate, startDate),
        lte(payments.paymentDate, endDate)
      ));
    
    results.push({
      month: month + 1,
      usd: Number(usdResult[0]?.total ?? 0),
      riel: Number(rielResult[0]?.total ?? 0),
    });
  }
  
  return results;
}
