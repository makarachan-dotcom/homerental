import { getDb } from "./connection";
import { settings } from "@db/schema";
import { eq } from "drizzle-orm";
import type { InsertSetting } from "@db/schema";

export async function findAllSettings(group?: string) {
  const db = getDb();
  if (group) {
    return db.select().from(settings).where(eq(settings.group, group));
  }
  return db.select().from(settings);
}

export async function findSettingByKey(key: string) {
  return getDb().query.settings.findFirst({
    where: eq(settings.key, key),
  });
}

export async function createOrUpdateSetting(data: InsertSetting) {
  const db = getDb();
  const existing = await findSettingByKey(data.key);
  
  if (existing) {
    await db.update(settings)
      .set({ value: data.value, group: data.group, description: data.description })
      .where(eq(settings.id, existing.id));
    return db.query.settings.findFirst({ where: eq(settings.id, existing.id) });
  }
  
  const [{ id }] = await db.insert(settings).values(data).$returningId();
  return db.query.settings.findFirst({ where: eq(settings.id, id) });
}

export async function deleteSetting(id: number) {
  return getDb().delete(settings).where(eq(settings.id, id));
}
