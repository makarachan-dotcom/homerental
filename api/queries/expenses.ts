import { getDb } from "./connection";
import { expenses } from "@db/schema";
import { eq, and, desc, sum, gte, lte, sql } from "drizzle-orm";
import type { InsertExpense } from "@db/schema";

export async function findAllExpenses(search?: string, type?: string, fromDate?: string, toDate?: string) {
  const db = getDb();
  const conditions = [];
  
  if (search) {
    conditions.push(sql`${expenses.description} LIKE ${`%${search}%`} OR ${expenses.vendor} LIKE ${`%${search}%`}`);
  }
  if (type && type !== "all") {
    conditions.push(eq(expenses.expenseType, type as any));
  }
  if (fromDate) {
    conditions.push(gte(expenses.expenseDate, new Date(fromDate)));
  }
  if (toDate) {
    conditions.push(lte(expenses.expenseDate, new Date(toDate)));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  return db.query.expenses.findMany({
    where: whereClause,
    with: {
      room: true,
    },
    orderBy: desc(expenses.expenseDate),
  });
}

export async function findExpenseById(id: number) {
  return getDb().query.expenses.findFirst({
    where: eq(expenses.id, id),
    with: {
      room: true,
    },
  });
}

export async function createExpense(data: InsertExpense) {
  const db = getDb();
  const [{ id }] = await db.insert(expenses).values(data).$returningId();
  return db.query.expenses.findFirst({ 
    where: eq(expenses.id, id),
    with: { room: true }
  });
}

export async function updateExpense(id: number, data: Partial<InsertExpense>) {
  const db = getDb();
  await db.update(expenses).set(data).where(eq(expenses.id, id));
  return db.query.expenses.findFirst({ 
    where: eq(expenses.id, id),
    with: { room: true }
  });
}

export async function deleteExpense(id: number) {
  return getDb().delete(expenses).where(eq(expenses.id, id));
}

export async function getExpenseStats() {
  const db = getDb();
  
  const totalUSD = await db.select({ total: sum(expenses.amountUSD) }).from(expenses);
  const totalRiel = await db.select({ total: sum(expenses.amountRiel) }).from(expenses);
  
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const monthlyUSD = await db
    .select({ total: sum(expenses.amountUSD) })
    .from(expenses)
    .where(gte(expenses.expenseDate, currentMonth));
  const monthlyRiel = await db
    .select({ total: sum(expenses.amountRiel) })
    .from(expenses)
    .where(gte(expenses.expenseDate, currentMonth));
  
  return {
    totalUSD: Number(totalUSD[0]?.total ?? 0),
    totalRiel: Number(totalRiel[0]?.total ?? 0),
    monthlyUSD: Number(monthlyUSD[0]?.total ?? 0),
    monthlyRiel: Number(monthlyRiel[0]?.total ?? 0),
  };
}
