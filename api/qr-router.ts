import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { findTenantById } from "./queries/tenants";
import { findRoomById } from "./queries/rooms";
import { findPaymentById } from "./queries/payments";

export const qrRouter = createRouter({
  tenantInfo: publicQuery
    .input(z.number())
    .query(async ({ input }) => {
      const tenant = await findTenantById(input);
      if (!tenant) throw new Error("Tenant not found");
      
      const room = tenant.room ? await findRoomById(tenant.room.id) : null;
      
      return {
        tenant: {
          id: tenant.id,
          fullNameKh: tenant.fullNameKh,
          fullNameEn: tenant.fullNameEn,
          phoneNumber: tenant.phoneNumber,
          email: tenant.email,
          idCardNumber: tenant.idCardNumber,
          address: tenant.address,
          status: tenant.status,
          room: room ? {
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            monthlyRentUSD: room.monthlyRentUSD,
            monthlyRentRiel: room.monthlyRentRiel,
          } : null,
        },
      };
    }),

  paymentInfo: publicQuery
    .input(z.number())
    .query(async ({ input }) => {
      const payment = await findPaymentById(input);
      if (!payment) throw new Error("Payment not found");
      
      return {
        payment: {
          id: payment.id,
          paymentNumber: payment.paymentNumber,
          paymentType: payment.paymentType,
          amountUSD: payment.amountUSD,
          amountRiel: payment.amountRiel,
          currency: payment.currency,
          paymentDate: payment.paymentDate,
          dueDate: payment.dueDate,
          status: payment.status,
          tenant: payment.tenant ? {
            fullNameKh: payment.tenant.fullNameKh,
            phoneNumber: payment.tenant.phoneNumber,
          } : null,
          room: payment.room ? {
            roomNumber: payment.room.roomNumber,
          } : null,
        },
      };
    }),

  generatePaymentData: publicQuery
    .input(z.object({
      tenantId: z.number(),
      roomId: z.number(),
      amountUSD: z.string().or(z.number()).default("0"),
      amountRiel: z.string().or(z.number()).default("0"),
      paymentType: z.string().default("rent"),
      month: z.string().default(new Date().toISOString().slice(0, 7)),
    }))
    .query(({ input }) => {
      return {
        businessName: "សុខលីផ្ទះជួល",
        location: "Domnak Thom 5, Phnom Penh, Cambodia",
        tenantId: input.tenantId,
        roomId: input.roomId,
        amountUSD: String(input.amountUSD),
        amountRiel: String(input.amountRiel),
        paymentType: input.paymentType,
        month: input.month,
        generatedAt: new Date().toISOString(),
        qrData: JSON.stringify({
          business: "សុខលីផ្ទះជួល",
          tenantId: input.tenantId,
          roomId: input.roomId,
          usd: input.amountUSD,
          riel: input.amountRiel,
          type: input.paymentType,
          month: input.month,
        }),
      };
    }),
});
