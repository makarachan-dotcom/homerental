import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { rooms, tenants, contracts, payments, expenses } from "@db/schema";
import { eq, and, gte, lte, count, sum, sql } from "drizzle-orm";

export const dashboardRouter = createRouter({
  stats: publicQuery.query(async () => {
    const db = getDb();
    
    const totalRooms = await db.select({ count: count() }).from(rooms);
    const occupiedRooms = await db.select({ count: count() }).from(rooms).where(eq(rooms.status, "occupied"));
    const availableRooms = await db.select({ count: count() }).from(rooms).where(eq(rooms.status, "available"));
    
    const totalTenants = await db.select({ count: count() }).from(tenants);
    const activeTenants = await db.select({ count: count() }).from(tenants).where(eq(tenants.status, "active"));
    
    const activeContracts = await db.select({ count: count() }).from(contracts).where(eq(contracts.status, "active"));
    
    const totalPaid = await db.select({ total: sum(payments.amountUSD), count: count() })
      .from(payments)
      .where(eq(payments.status, "paid"));
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    const monthlyRevenueUSD = await db.select({ total: sum(payments.amountUSD) })
      .from(payments)
      .where(and(eq(payments.status, "paid"), gte(payments.paymentDate, currentMonth)));
    const monthlyRevenueRiel = await db.select({ total: sum(payments.amountRiel) })
      .from(payments)
      .where(and(eq(payments.status, "paid"), gte(payments.paymentDate, currentMonth)));
    
    const pendingPayments = await db.select({ count: count(), total: sum(payments.amountUSD) })
      .from(payments)
      .where(eq(payments.status, "pending"));
    
    const overduePayments = await db.select({ count: count(), total: sum(payments.amountUSD) })
      .from(payments)
      .where(eq(payments.status, "overdue"));
    
    const totalExpensesUSD = await db.select({ total: sum(expenses.amountUSD) }).from(expenses);
    const monthlyExpensesUSD = await db.select({ total: sum(expenses.amountUSD) })
      .from(expenses)
      .where(gte(expenses.expenseDate, currentMonth));
    
    return {
      rooms: {
        total: Number(totalRooms[0]?.count ?? 0),
        occupied: Number(occupiedRooms[0]?.count ?? 0),
        available: Number(availableRooms[0]?.count ?? 0),
        occupancyRate: totalRooms[0]?.count ? Math.round((occupiedRooms[0]?.count ?? 0) / totalRooms[0].count * 100) : 0,
      },
      tenants: {
        total: Number(totalTenants[0]?.count ?? 0),
        active: Number(activeTenants[0]?.count ?? 0),
      },
      contracts: {
        active: Number(activeContracts[0]?.count ?? 0),
      },
      payments: {
        totalRevenueUSD: Number(totalPaid[0]?.total ?? 0),
        totalCount: Number(totalPaid[0]?.count ?? 0),
        monthlyRevenueUSD: Number(monthlyRevenueUSD[0]?.total ?? 0),
        monthlyRevenueRiel: Number(monthlyRevenueRiel[0]?.total ?? 0),
        pendingCount: Number(pendingPayments[0]?.count ?? 0),
        pendingAmountUSD: Number(pendingPayments[0]?.total ?? 0),
        overdueCount: Number(overduePayments[0]?.count ?? 0),
        overdueAmountUSD: Number(overduePayments[0]?.total ?? 0),
      },
      expenses: {
        totalUSD: Number(totalExpensesUSD[0]?.total ?? 0),
        monthlyUSD: Number(monthlyExpensesUSD[0]?.total ?? 0),
      },
    };
  }),

  recentActivity: publicQuery.query(async () => {
    const db = getDb();
    
    const recentPayments = await db.query.payments.findMany({
      with: { tenant: true, room: true },
      orderBy: sql`${payments.createdAt} DESC`,
      limit: 10,
    });
    
    const recentTenants = await db.query.tenants.findMany({
      with: { room: true },
      orderBy: sql`${tenants.createdAt} DESC`,
      limit: 5,
    });
    
    return {
      payments: recentPayments,
      tenants: recentTenants,
    };
  }),

  monthlyRevenue: publicQuery
    .input(z.object({ year: z.number().default(new Date().getFullYear()) }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = [];
      
      for (let month = 0; month < 12; month++) {
        const startDate = new Date(input.year, month, 1);
        const endDate = new Date(input.year, month + 1, 0);
        
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
    }),
});
