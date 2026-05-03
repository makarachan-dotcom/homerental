import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllMeterReadings,
  findMeterReadingById,
  findLatestMeterReading,
  createMeterReading,
  updateMeterReading,
  deleteMeterReading,
} from "./queries/meterReadings";

export const meterReadingRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        roomId: z.number().optional(),
        type: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => findAllMeterReadings(input?.roomId, input?.type)),

  byId: publicQuery
    .input(z.number())
    .query(({ input }) => findMeterReadingById(input)),

  latest: publicQuery
    .input(z.object({ roomId: z.number(), type: z.enum(["electricity", "water"]) }))
    .query(({ input }) => findLatestMeterReading(input.roomId, input.type)),

  create: adminQuery
    .input(
      z.object({
        roomId: z.number(),
        readingType: z.enum(["electricity", "water"]),
        readingDate: z.string(),
        previousReading: z.string().or(z.number()),
        currentReading: z.string().or(z.number()),
        usage: z.string().or(z.number()),
        rate: z.string().or(z.number()),
        amount: z.string().or(z.number()),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const reading = await createMeterReading({
        ...input,
        previousReading: String(input.previousReading),
        currentReading: String(input.currentReading),
        usage: String(input.usage),
        rate: String(input.rate),
        amount: String(input.amount),
        createdBy: ctx.user?.id,
      } as any);
      return reading;
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        roomId: z.number().optional(),
        readingType: z.enum(["electricity", "water"]).optional(),
        readingDate: z.string().optional(),
        previousReading: z.string().or(z.number()).optional(),
        currentReading: z.string().or(z.number()).optional(),
        usage: z.string().or(z.number()).optional(),
        rate: z.string().or(z.number()).optional(),
        amount: z.string().or(z.number()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.previousReading !== undefined) updateData.previousReading = String(data.previousReading);
      if (data.currentReading !== undefined) updateData.currentReading = String(data.currentReading);
      if (data.usage !== undefined) updateData.usage = String(data.usage);
      if (data.rate !== undefined) updateData.rate = String(data.rate);
      if (data.amount !== undefined) updateData.amount = String(data.amount);
      return updateMeterReading(id, updateData);
    }),

  delete: adminQuery
    .input(z.number())
    .mutation(({ input }) => deleteMeterReading(input)),
});
