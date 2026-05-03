import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllNotices,
  findNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from "./queries/notices";

export const noticeRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => findAllNotices(input?.status)),

  byId: publicQuery
    .input(z.number())
    .query(({ input }) => findNoticeById(input)),

  create: adminQuery
    .input(
      z.object({
        titleKh: z.string().min(1),
        titleEn: z.string().optional(),
        contentKh: z.string().min(1),
        contentEn: z.string().optional(),
        targetAudience: z.enum(["all", "active_tenants", "specific_room", "specific_tenant"]).default("all"),
        targetRoomId: z.number().optional(),
        targetTenantId: z.number().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
        startDate: z.string(),
        endDate: z.string().optional(),
        isPublished: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const data: any = { ...input };
      if (input.startDate) data.startDate = new Date(input.startDate);
      if (input.endDate) data.endDate = input.endDate ? new Date(input.endDate) : undefined;
      const notice = await createNotice({
        ...data,
        createdBy: ctx.user?.id,
      });
      return notice;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        titleKh: z.string().min(1).optional(),
        titleEn: z.string().optional(),
        contentKh: z.string().min(1).optional(),
        contentEn: z.string().optional(),
        targetAudience: z.enum(["all", "active_tenants", "specific_room", "specific_tenant"]).optional(),
        targetRoomId: z.number().optional(),
        targetTenantId: z.number().optional(),
        priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...rest } = input;
      const data: any = { ...rest };
      if (input.startDate) data.startDate = new Date(input.startDate);
      if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;
      return updateNotice(id, data);
    }),

  delete: adminQuery
    .input(z.number())
    .mutation(({ input }) => deleteNotice(input)),
});
