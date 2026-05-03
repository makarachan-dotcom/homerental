import { relations } from "drizzle-orm";
import { users, rooms, tenants, contracts, payments, expenses, notices, meterReadings } from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  payments: many(payments),
  expenses: many(expenses),
  notices: many(notices),
  meterReadings: many(meterReadings),
}));

export const roomsRelations = relations(rooms, ({ many }) => ({
  tenants: many(tenants),
  contracts: many(contracts),
  payments: many(payments),
  expenses: many(expenses),
  notices: many(notices),
  meterReadings: many(meterReadings),
}));

export const tenantsRelations = relations(tenants, ({ one, many }) => ({
  room: one(rooms, {
    fields: [tenants.roomId],
    references: [rooms.id],
  }),
  contracts: many(contracts),
  payments: many(payments),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [contracts.tenantId],
    references: [tenants.id],
  }),
  room: one(rooms, {
    fields: [contracts.roomId],
    references: [rooms.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [payments.tenantId],
    references: [tenants.id],
  }),
  room: one(rooms, {
    fields: [payments.roomId],
    references: [rooms.id],
  }),
  contract: one(contracts, {
    fields: [payments.contractId],
    references: [contracts.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  room: one(rooms, {
    fields: [expenses.roomId],
    references: [rooms.id],
  }),
}));

export const noticesRelations = relations(notices, ({ one }) => ({
  targetRoom: one(rooms, {
    fields: [notices.targetRoomId],
    references: [rooms.id],
  }),
  targetTenant: one(tenants, {
    fields: [notices.targetTenantId],
    references: [tenants.id],
  }),
}));

export const meterReadingsRelations = relations(meterReadings, ({ one }) => ({
  room: one(rooms, {
    fields: [meterReadings.roomId],
    references: [rooms.id],
  }),
}));
