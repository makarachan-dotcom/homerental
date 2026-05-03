import { getDb } from "./connection";
import { meterReadings } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import type { InsertMeterReading } from "@db/schema";

export async function findAllMeterReadings(roomId?: number, type?: string) {
  const db = getDb();
  const conditions = [];
  
  if (roomId) {
    conditions.push(eq(meterReadings.roomId, roomId));
  }
  if (type && type !== "all") {
    conditions.push(eq(meterReadings.readingType, type as any));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  return db.query.meterReadings.findMany({
    where: whereClause,
    with: {
      room: true,
    },
    orderBy: desc(meterReadings.readingDate),
  });
}

export async function findMeterReadingById(id: number) {
  return getDb().query.meterReadings.findFirst({
    where: eq(meterReadings.id, id),
    with: {
      room: true,
    },
  });
}

export async function findLatestMeterReading(roomId: number, type: string) {
  return getDb().query.meterReadings.findFirst({
    where: and(
      eq(meterReadings.roomId, roomId),
      eq(meterReadings.readingType, type as any)
    ),
    orderBy: desc(meterReadings.readingDate),
  });
}

export async function createMeterReading(data: InsertMeterReading) {
  const db = getDb();
  const [{ id }] = await db.insert(meterReadings).values(data).$returningId();
  return db.query.meterReadings.findFirst({ 
    where: eq(meterReadings.id, id),
    with: { room: true }
  });
}

export async function updateMeterReading(id: number, data: Partial<InsertMeterReading>) {
  const db = getDb();
  await db.update(meterReadings).set(data).where(eq(meterReadings.id, id));
  return db.query.meterReadings.findFirst({ 
    where: eq(meterReadings.id, id),
    with: { room: true }
  });
}

export async function deleteMeterReading(id: number) {
  return getDb().delete(meterReadings).where(eq(meterReadings.id, id));
}
