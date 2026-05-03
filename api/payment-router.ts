import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllPayments,
  findPaymentById,
  findPaymentsByTenantId,
  findPaymentsByRoomId,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStats,
  getMonthlyPaymentData,
} from "./queries/payments";

export const paymentRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => findAllPayments(input?.search, input?.status, input?.fromDate, input?.toDate)),

  byId: publicQuery
    .input(z.number())
    .query(({ input }) => findPaymentById(input)),

  byTenantId: publicQuery
    .input(z.number())
    .query(({ input }) => findPaymentsByTenantId(input)),

  byRoomId: publicQuery
    .input(z.number())
    .query(({ input }) => findPaymentsByRoomId(input)),

  create: adminQuery
    .input(
      z.object({
        tenantId: z.number(),
        roomId: z.number(),
        contractId: z.number().optional(),
        paymentNumber: z.string().min(1),
        paymentType: z.enum(["rent", "deposit", "electricity", "water", "internet", "trash", "maintenance", "other", "penalty"]).default("rent"),
        amountUSD: z.string().or(z.number()).default("0"),
        amountRiel: z.string().or(z.number()).default("0"),
        exchangeRate: z.string().or(z.number()).default("4100"),
        currency: z.enum(["usd", "riel", "both"]).default("usd"),
        paymentMethod: z.enum(["cash", "bank_transfer", "aba", "wing", "acleda", "qr_code", "other"]).default("cash"),
        paymentDate: z.string(),
        dueDate: z.string().optional(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
        electricityOldReading: z.string().or(z.number()).optional(),
        electricityNewReading: z.string().or(z.number()).optional(),
        electricityUsage: z.string().or(z.number()).optional(),
        electricityAmount: z.string().or(z.number()).optional(),
        waterOldReading: z.string().or(z.number()).optional(),
        waterNewReading: z.string().or(z.number()).optional(),
        waterUsage: z.string().or(z.number()).optional(),
        waterAmount: z.string().or(z.number()).optional(),
        receiptNumber: z.string().optional(),
        status: z.enum(["paid", "pending", "overdue", "partial", "cancelled"]).default("pending"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const payment = await createPayment({
        ...input,
        amountUSD: String(input.amountUSD),
        amountRiel: String(input.amountRiel),
        exchangeRate: String(input.exchangeRate),
        electricityOldReading: input.electricityOldReading ? String(input.electricityOldReading) : undefined,
        electricityNewReading: input.electricityNewReading ? String(input.electricityNewReading) : undefined,
        electricityUsage: input.electricityUsage ? String(input.electricityUsage) : undefined,
        electricityAmount: input.electricityAmount ? String(input.electricityAmount) : undefined,
        waterOldReading: input.waterOldReading ? String(input.waterOldReading) : undefined,
        waterNewReading: input.waterNewReading ? String(input.waterNewReading) : undefined,
        waterUsage: input.waterUsage ? String(input.waterUsage) : undefined,
        waterAmount: input.waterAmount ? String(input.waterAmount) : undefined,
        createdBy: ctx.user?.id,
      } as any);
      return payment;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number().optional(),
        roomId: z.number().optional(),
        contractId: z.number().optional(),
        paymentNumber: z.string().min(1).optional(),
        paymentType: z.enum(["rent", "deposit", "electricity", "water", "internet", "trash", "maintenance", "other", "penalty"]).optional(),
        amountUSD: z.string().or(z.number()).optional(),
        amountRiel: z.string().or(z.number()).optional(),
        exchangeRate: z.string().or(z.number()).optional(),
        currency: z.enum(["usd", "riel", "both"]).optional(),
        paymentMethod: z.enum(["cash", "bank_transfer", "aba", "wing", "acleda", "qr_code", "other"]).optional(),
        paymentDate: z.string().optional(),
        dueDate: z.string().optional(),
        periodStart: z.string().optional(),
        periodEnd: z.string().optional(),
        status: z.enum(["paid", "pending", "overdue", "partial", "cancelled"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.amountUSD !== undefined) updateData.amountUSD = String(data.amountUSD);
      if (data.amountRiel !== undefined) updateData.amountRiel = String(data.amountRiel);
      if (data.exchangeRate !== undefined) updateData.exchangeRate = String(data.exchangeRate);
      return updatePayment(id, updateData);
    }),

  delete: adminQuery
    .input(z.number())
    .mutation(({ input }) => deletePayment(input)),

  stats: publicQuery.query(() => getPaymentStats()),

  monthlyData: publicQuery
    .input(z.object({ year: z.number().default(new Date().getFullYear()) }))
    .query(({ input }) => getMonthlyPaymentData(input.year)),
});
