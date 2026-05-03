import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllTenants,
  findTenantById,
  findTenantByRoomId,
  createTenant,
  updateTenant,
  deleteTenant,
  getTenantStats,
} from "./queries/tenants";

export const tenantRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => findAllTenants(input?.search, input?.status)),

  byId: publicQuery
    .input(z.number())
    .query(({ input }) => findTenantById(input)),

  byRoomId: publicQuery
    .input(z.number())
    .query(({ input }) => findTenantByRoomId(input)),

  create: adminQuery
    .input(
      z.object({
        roomId: z.number().optional(),
        fullNameKh: z.string().min(1),
        fullNameEn: z.string().optional(),
        phoneNumber: z.string().min(1),
        phoneNumber2: z.string().optional(),
        email: z.string().email().optional(),
        idCardNumber: z.string().optional(),
        idCardType: z.enum(["national_id", "passport", "driver_license", "other"]).default("national_id"),
        dateOfBirth: z.string().optional(),
        nationality: z.string().default("Cambodian"),
        occupation: z.string().optional(),
        workplace: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
        emergencyContactRelation: z.string().optional(),
        address: z.string().optional(),
        province: z.string().optional(),
        district: z.string().optional(),
        commune: z.string().optional(),
        village: z.string().optional(),
        familyMembers: z.number().default(1),
        vehicleInfo: z.string().optional(),
        status: z.enum(["active", "inactive", "blacklisted"]).default("active"),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const data: any = { ...input };
      if (input.dateOfBirth) data.dateOfBirth = new Date(input.dateOfBirth);
      return createTenant(data);
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        roomId: z.number().optional(),
        fullNameKh: z.string().min(1).optional(),
        fullNameEn: z.string().optional(),
        phoneNumber: z.string().min(1).optional(),
        phoneNumber2: z.string().optional(),
        email: z.string().email().optional(),
        idCardNumber: z.string().optional(),
        idCardType: z.enum(["national_id", "passport", "driver_license", "other"]).optional(),
        dateOfBirth: z.string().optional(),
        nationality: z.string().optional(),
        occupation: z.string().optional(),
        workplace: z.string().optional(),
        emergencyContactName: z.string().optional(),
        emergencyContactPhone: z.string().optional(),
        emergencyContactRelation: z.string().optional(),
        address: z.string().optional(),
        province: z.string().optional(),
        district: z.string().optional(),
        commune: z.string().optional(),
        village: z.string().optional(),
        familyMembers: z.number().optional(),
        vehicleInfo: z.string().optional(),
        status: z.enum(["active", "inactive", "blacklisted"]).optional(),
        notes: z.string().optional(),
        qrCodeUrl: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...rest } = input;
      const data: any = { ...rest };
      if (input.dateOfBirth) data.dateOfBirth = new Date(input.dateOfBirth);
      return updateTenant(id, data);
    }),

  delete: adminQuery
    .input(z.number())
    .mutation(({ input }) => deleteTenant(input)),

  stats: publicQuery.query(() => getTenantStats()),
});
