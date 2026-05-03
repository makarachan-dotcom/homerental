import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllContracts,
  findContractById,
  findContractsByTenantId,
  findContractsByRoomId,
  createContract,
  updateContract,
  deleteContract,
  getContractStats,
} from "./queries/contracts";

export const contractRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => findAllContracts(input?.status)),

  byId: publicQuery
    .input(z.number())
    .query(({ input }) => findContractById(input)),

  byTenantId: publicQuery
    .input(z.number())
    .query(({ input }) => findContractsByTenantId(input)),

  byRoomId: publicQuery
    .input(z.number())
    .query(({ input }) => findContractsByRoomId(input)),

  create: adminQuery
    .input(
      z.object({
        tenantId: z.number(),
        roomId: z.number(),
        contractNumber: z.string().min(1),
        startDate: z.string(),
        endDate: z.string(),
        monthlyRentUSD: z.string().or(z.number()).default("0"),
        monthlyRentRiel: z.string().or(z.number()).default("0"),
        depositUSD: z.string().or(z.number()).default("0"),
        depositRiel: z.string().or(z.number()).default("0"),
        paymentDay: z.number().default(1),
        paymentMethod: z.enum(["cash", "bank_transfer", "aba", "wing", "acleda", "qr_code"]).default("cash"),
        electricityIncluded: z.boolean().default(false),
        waterIncluded: z.boolean().default(false),
        internetIncluded: z.boolean().default(false),
        trashIncluded: z.boolean().default(false),
        otherTerms: z.string().optional(),
        status: z.enum(["active", "expired", "terminated", "renewed"]).default("active"),
      })
    )
    .mutation(async ({ input }) => {
      return createContract({
        ...input,
        monthlyRentUSD: String(input.monthlyRentUSD),
        monthlyRentRiel: String(input.monthlyRentRiel),
        depositUSD: String(input.depositUSD),
        depositRiel: String(input.depositRiel),
      } as any);
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        tenantId: z.number().optional(),
        roomId: z.number().optional(),
        contractNumber: z.string().min(1).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        monthlyRentUSD: z.string().or(z.number()).optional(),
        monthlyRentRiel: z.string().or(z.number()).optional(),
        depositUSD: z.string().or(z.number()).optional(),
        depositRiel: z.string().or(z.number()).optional(),
        paymentDay: z.number().optional(),
        paymentMethod: z.enum(["cash", "bank_transfer", "aba", "wing", "acleda", "qr_code"]).optional(),
        electricityIncluded: z.boolean().optional(),
        waterIncluded: z.boolean().optional(),
        internetIncluded: z.boolean().optional(),
        trashIncluded: z.boolean().optional(),
        otherTerms: z.string().optional(),
        status: z.enum(["active", "expired", "terminated", "renewed"]).optional(),
        terminationDate: z.string().optional(),
        terminationReason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.monthlyRentUSD !== undefined) updateData.monthlyRentUSD = String(data.monthlyRentUSD);
      if (data.monthlyRentRiel !== undefined) updateData.monthlyRentRiel = String(data.monthlyRentRiel);
      if (data.depositUSD !== undefined) updateData.depositUSD = String(data.depositUSD);
      if (data.depositRiel !== undefined) updateData.depositRiel = String(data.depositRiel);
      return updateContract(id, updateData);
    }),

  delete: adminQuery
    .input(z.number())
    .mutation(({ input }) => deleteContract(input)),

  stats: publicQuery.query(() => getContractStats()),
});
