import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import {
  findAllRooms,
  findRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStats,
} from "./queries/rooms";

export const roomRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => findAllRooms(input?.search, input?.status)),

  byId: publicQuery
    .input(z.number())
    .query(({ input }) => findRoomById(input)),

  create: adminQuery
    .input(
      z.object({
        roomNumber: z.string().min(1),
        floor: z.string().optional(),
        roomType: z.enum(["single", "double", "family", "studio", "shop"]).default("single"),
        status: z.enum(["available", "occupied", "maintenance", "reserved"]).default("available"),
        monthlyRentUSD: z.string().or(z.number()).default("0"),
        monthlyRentRiel: z.string().or(z.number()).default("0"),
        depositUSD: z.string().or(z.number()).default("0"),
        depositRiel: z.string().or(z.number()).default("0"),
        electricityRate: z.string().or(z.number()).default("0.25"),
        waterRate: z.string().or(z.number()).default("0.50"),
        description: z.string().optional(),
        amenities: z.string().optional(),
        squareMeters: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createRoom({
        ...input,
        monthlyRentUSD: String(input.monthlyRentUSD),
        monthlyRentRiel: String(input.monthlyRentRiel),
        depositUSD: String(input.depositUSD),
        depositRiel: String(input.depositRiel),
        electricityRate: String(input.electricityRate),
        waterRate: String(input.waterRate),
      } as any);
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        roomNumber: z.string().min(1).optional(),
        floor: z.string().optional(),
        roomType: z.enum(["single", "double", "family", "studio", "shop"]).optional(),
        status: z.enum(["available", "occupied", "maintenance", "reserved"]).optional(),
        monthlyRentUSD: z.string().or(z.number()).optional(),
        monthlyRentRiel: z.string().or(z.number()).optional(),
        depositUSD: z.string().or(z.number()).optional(),
        depositRiel: z.string().or(z.number()).optional(),
        electricityRate: z.string().or(z.number()).optional(),
        waterRate: z.string().or(z.number()).optional(),
        description: z.string().optional(),
        amenities: z.string().optional(),
        squareMeters: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.monthlyRentUSD !== undefined) updateData.monthlyRentUSD = String(data.monthlyRentUSD);
      if (data.monthlyRentRiel !== undefined) updateData.monthlyRentRiel = String(data.monthlyRentRiel);
      if (data.depositUSD !== undefined) updateData.depositUSD = String(data.depositUSD);
      if (data.depositRiel !== undefined) updateData.depositRiel = String(data.depositRiel);
      if (data.electricityRate !== undefined) updateData.electricityRate = String(data.electricityRate);
      if (data.waterRate !== undefined) updateData.waterRate = String(data.waterRate);
      return updateRoom(id, updateData);
    }),

  delete: adminQuery
    .input(z.number())
    .mutation(({ input }) => deleteRoom(input)),

  stats: publicQuery.query(() => getRoomStats()),
});
