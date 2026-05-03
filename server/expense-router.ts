import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllExpenses,
  findExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from "./queries/expenses";

export const expenseRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        type: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => findAllExpenses(input?.search, input?.type, input?.fromDate, input?.toDate)),

  byId: publicQuery
    .input(z.number())
    .query(({ input }) => findExpenseById(input)),

  create: adminQuery
    .input(
      z.object({
        expenseType: z.enum(["repair", "maintenance", "utility", "supplies", "tax", "salary", "insurance", "marketing", "other"]).default("other"),
        category: z.string().optional(),
        description: z.string().min(1),
        amountUSD: z.string().or(z.number()).default("0"),
        amountRiel: z.string().or(z.number()).default("0"),
        expenseDate: z.string(),
        vendor: z.string().optional(),
        receiptNumber: z.string().optional(),
        roomId: z.number().optional(),
        status: z.enum(["paid", "pending", "approved", "rejected"]).default("paid"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const expense = await createExpense({
        ...input,
        amountUSD: String(input.amountUSD),
        amountRiel: String(input.amountRiel),
        createdBy: ctx.user?.id,
      } as any);
      return expense;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        expenseType: z.enum(["repair", "maintenance", "utility", "supplies", "tax", "salary", "insurance", "marketing", "other"]).optional(),
        category: z.string().optional(),
        description: z.string().min(1).optional(),
        amountUSD: z.string().or(z.number()).optional(),
        amountRiel: z.string().or(z.number()).optional(),
        expenseDate: z.string().optional(),
        vendor: z.string().optional(),
        receiptNumber: z.string().optional(),
        roomId: z.number().optional(),
        status: z.enum(["paid", "pending", "approved", "rejected"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.amountUSD !== undefined) updateData.amountUSD = String(data.amountUSD);
      if (data.amountRiel !== undefined) updateData.amountRiel = String(data.amountRiel);
      return updateExpense(id, updateData);
    }),

  delete: adminQuery
    .input(z.number())
    .mutation(({ input }) => deleteExpense(input)),

  stats: publicQuery.query(() => getExpenseStats()),
});
