import { getDb } from "./connection";
import { rooms } from "@db/schema";
import { eq, like, and, desc, count } from "drizzle-orm";
import type { InsertRoom } from "@db/schema";

export async function findAllRooms(search?: string, status?: string) {
  const db = getDb();
  const conditions = [];
  
  if (search) {
    conditions.push(like(rooms.roomNumber, `%${search}%`));
  }
  if (status && status !== "all") {
    conditions.push(eq(rooms.status, status as any));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  return db.query.rooms.findMany({
    where: whereClause,
    orderBy: desc(rooms.createdAt),
  });
}

export async function findRoomById(id: number) {
  return getDb().query.rooms.findFirst({
    where: eq(rooms.id, id),
  });
}

export async function createRoom(data: InsertRoom) {
  const db = getDb();
  const [{ id }] = await db.insert(rooms).values(data).$returningId();
  return db.query.rooms.findFirst({ where: eq(rooms.id, id) });
}

export async function updateRoom(id: number, data: Partial<InsertRoom>) {
  const db = getDb();
  await db.update(rooms).set(data).where(eq(rooms.id, id));
  return db.query.rooms.findFirst({ where: eq(rooms.id, id) });
}

export async function deleteRoom(id: number) {
  return getDb().delete(rooms).where(eq(rooms.id, id));
}

export async function getRoomStats() {
  const db = getDb();
  const total = await db.select({ count: count() }).from(rooms);
  const occupied = await db.select({ count: count() }).from(rooms).where(eq(rooms.status, "occupied"));
  const available = await db.select({ count: count() }).from(rooms).where(eq(rooms.status, "available"));
  const maintenance = await db.select({ count: count() }).from(rooms).where(eq(rooms.status, "maintenance"));
  
  return {
    total: total[0]?.count ?? 0,
    occupied: occupied[0]?.count ?? 0,
    available: available[0]?.count ?? 0,
    maintenance: maintenance[0]?.count ?? 0,
  };
}
