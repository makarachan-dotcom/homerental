import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  int,
  date,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const rooms = mysqlTable("rooms", {
  id: serial("id").primaryKey(),
  roomNumber: varchar("roomNumber", { length: 50 }).notNull(),
  floor: varchar("floor", { length: 20 }).default("1"),
  roomType: mysqlEnum("roomType", ["single", "double", "family", "studio", "shop"]).default("single").notNull(),
  status: mysqlEnum("status", ["available", "occupied", "maintenance", "reserved"]).default("available").notNull(),
  monthlyRentUSD: decimal("monthlyRentUSD", { precision: 10, scale: 2 }).default("0").notNull(),
  monthlyRentRiel: decimal("monthlyRentRiel", { precision: 12, scale: 0 }).default("0").notNull(),
  depositUSD: decimal("depositUSD", { precision: 10, scale: 2 }).default("0").notNull(),
  depositRiel: decimal("depositRiel", { precision: 12, scale: 0 }).default("0").notNull(),
  electricityRate: decimal("electricityRate", { precision: 10, scale: 2 }).default("0.25").notNull(),
  waterRate: decimal("waterRate", { precision: 10, scale: 2 }).default("0.50").notNull(),
  description: text("description"),
  amenities: text("amenities"),
  squareMeters: int("squareMeters"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  roomNumberIdx: index("room_number_idx").on(table.roomNumber),
  statusIdx: index("status_idx").on(table.status),
}));

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

export const tenants = mysqlTable("tenants", {
  id: serial("id").primaryKey(),
  roomId: bigint("roomId", { mode: "number", unsigned: true }),
  fullNameKh: varchar("fullNameKh", { length: 255 }).notNull(),
  fullNameEn: varchar("fullNameEn", { length: 255 }),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  phoneNumber2: varchar("phoneNumber2", { length: 20 }),
  email: varchar("email", { length: 320 }),
  idCardNumber: varchar("idCardNumber", { length: 50 }),
  idCardType: mysqlEnum("idCardType", ["national_id", "passport", "driver_license", "other"]).default("national_id"),
  dateOfBirth: date("dateOfBirth"),
  nationality: varchar("nationality", { length: 50 }).default("Cambodian"),
  occupation: varchar("occupation", { length: 100 }),
  workplace: varchar("workplace", { length: 255 }),
  emergencyContactName: varchar("emergencyContactName", { length: 255 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 20 }),
  emergencyContactRelation: varchar("emergencyContactRelation", { length: 50 }),
  address: text("address"),
  province: varchar("province", { length: 50 }),
  district: varchar("district", { length: 50 }),
  commune: varchar("commune", { length: 50 }),
  village: varchar("village", { length: 50 }),
  familyMembers: int("familyMembers").default(1),
  vehicleInfo: text("vehicleInfo"),
  status: mysqlEnum("status", ["active", "inactive", "blacklisted"]).default("active").notNull(),
  notes: text("notes"),
  qrCodeUrl: text("qrCodeUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  phoneIdx: index("tenant_phone_idx").on(table.phoneNumber),
  nameKhIdx: index("tenant_name_kh_idx").on(table.fullNameKh),
  roomIdIdx: index("tenant_room_idx").on(table.roomId),
}));

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

export const contracts = mysqlTable("contracts", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenantId", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("roomId", { mode: "number", unsigned: true }).notNull(),
  contractNumber: varchar("contractNumber", { length: 50 }).notNull().unique(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  monthlyRentUSD: decimal("monthlyRentUSD", { precision: 10, scale: 2 }).notNull(),
  monthlyRentRiel: decimal("monthlyRentRiel", { precision: 12, scale: 0 }).notNull(),
  depositUSD: decimal("depositUSD", { precision: 10, scale: 2 }).notNull(),
  depositRiel: decimal("depositRiel", { precision: 12, scale: 0 }).notNull(),
  paymentDay: int("paymentDay").default(1).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "aba", "wing", "acleda", "qr_code"]).default("cash").notNull(),
  electricityIncluded: boolean("electricityIncluded").default(false),
  waterIncluded: boolean("waterIncluded").default(false),
  internetIncluded: boolean("internetIncluded").default(false),
  trashIncluded: boolean("trashIncluded").default(false),
  otherTerms: text("otherTerms"),
  status: mysqlEnum("status", ["active", "expired", "terminated", "renewed"]).default("active").notNull(),
  terminationDate: date("terminationDate"),
  terminationReason: text("terminationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  tenantIdIdx: index("contract_tenant_idx").on(table.tenantId),
  roomIdIdx: index("contract_room_idx").on(table.roomId),
  statusIdx: index("contract_status_idx").on(table.status),
}));

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenantId", { mode: "number", unsigned: true }).notNull(),
  roomId: bigint("roomId", { mode: "number", unsigned: true }).notNull(),
  contractId: bigint("contractId", { mode: "number", unsigned: true }),
  paymentNumber: varchar("paymentNumber", { length: 50 }).notNull().unique(),
  paymentType: mysqlEnum("paymentType", ["rent", "deposit", "electricity", "water", "internet", "trash", "maintenance", "other", "penalty"]).default("rent").notNull(),
  amountUSD: decimal("amountUSD", { precision: 10, scale: 2 }).default("0").notNull(),
  amountRiel: decimal("amountRiel", { precision: 12, scale: 0 }).default("0").notNull(),
  exchangeRate: decimal("exchangeRate", { precision: 10, scale: 2 }).default("4100").notNull(),
  currency: mysqlEnum("currency", ["usd", "riel", "both"]).default("usd").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash", "bank_transfer", "aba", "wing", "acleda", "qr_code", "other"]).default("cash").notNull(),
  paymentDate: date("paymentDate").notNull(),
  dueDate: date("dueDate"),
  periodStart: date("periodStart"),
  periodEnd: date("periodEnd"),
  electricityOldReading: decimal("electricityOldReading", { precision: 10, scale: 2 }),
  electricityNewReading: decimal("electricityNewReading", { precision: 10, scale: 2 }),
  electricityUsage: decimal("electricityUsage", { precision: 10, scale: 2 }),
  electricityAmount: decimal("electricityAmount", { precision: 10, scale: 2 }),
  waterOldReading: decimal("waterOldReading", { precision: 10, scale: 2 }),
  waterNewReading: decimal("waterNewReading", { precision: 10, scale: 2 }),
  waterUsage: decimal("waterUsage", { precision: 10, scale: 2 }),
  waterAmount: decimal("waterAmount", { precision: 10, scale: 2 }),
  receiptNumber: varchar("receiptNumber", { length: 50 }),
  status: mysqlEnum("status", ["paid", "pending", "overdue", "partial", "cancelled"]).default("pending").notNull(),
  notes: text("notes"),
  qrCodeData: text("qrCodeData"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  tenantIdIdx: index("payment_tenant_idx").on(table.tenantId),
  roomIdIdx: index("payment_room_idx").on(table.roomId),
  paymentDateIdx: index("payment_date_idx").on(table.paymentDate),
  statusIdx: index("payment_status_idx").on(table.status),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const expenses = mysqlTable("expenses", {
  id: serial("id").primaryKey(),
  expenseType: mysqlEnum("expenseType", ["repair", "maintenance", "utility", "supplies", "tax", "salary", "insurance", "marketing", "other"]).default("other").notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description").notNull(),
  amountUSD: decimal("amountUSD", { precision: 10, scale: 2 }).default("0").notNull(),
  amountRiel: decimal("amountRiel", { precision: 12, scale: 0 }).default("0").notNull(),
  expenseDate: date("expenseDate").notNull(),
  vendor: varchar("vendor", { length: 255 }),
  receiptNumber: varchar("receiptNumber", { length: 50 }),
  roomId: bigint("roomId", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["paid", "pending", "approved", "rejected"]).default("paid").notNull(),
  notes: text("notes"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
}, (table) => ({
  expenseDateIdx: index("expense_date_idx").on(table.expenseDate),
  typeIdx: index("expense_type_idx").on(table.expenseType),
}));

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

export const notices = mysqlTable("notices", {
  id: serial("id").primaryKey(),
  titleKh: varchar("titleKh", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  contentKh: text("contentKh").notNull(),
  contentEn: text("contentEn"),
  targetAudience: mysqlEnum("targetAudience", ["all", "active_tenants", "specific_room", "specific_tenant"]).default("all").notNull(),
  targetRoomId: bigint("targetRoomId", { mode: "number", unsigned: true }),
  targetTenantId: bigint("targetTenantId", { mode: "number", unsigned: true }),
  priority: mysqlEnum("priority", ["low", "normal", "high", "urgent"]).default("normal").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Notice = typeof notices.$inferSelect;
export type InsertNotice = typeof notices.$inferInsert;

export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  group: varchar("group", { length: 50 }).default("general").notNull(),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

export const meterReadings = mysqlTable("meterReadings", {
  id: serial("id").primaryKey(),
  roomId: bigint("roomId", { mode: "number", unsigned: true }).notNull(),
  readingType: mysqlEnum("readingType", ["electricity", "water"]).notNull(),
  readingDate: date("readingDate").notNull(),
  previousReading: decimal("previousReading", { precision: 10, scale: 2 }).notNull(),
  currentReading: decimal("currentReading", { precision: 10, scale: 2 }).notNull(),
  usage: decimal("usage", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  roomIdIdx: index("meter_room_idx").on(table.roomId),
  readingDateIdx: index("meter_date_idx").on(table.readingDate),
}));

export type MeterReading = typeof meterReadings.$inferSelect;
export type InsertMeterReading = typeof meterReadings.$inferInsert;
