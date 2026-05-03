import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { findAllSettings, findSettingByKey, createOrUpdateSetting, deleteSetting } from "./queries/settings";

export const settingsRouter = createRouter({
  list: publicQuery
    .input(z.object({ group: z.string().optional() }).optional())
    .query(({ input }) => findAllSettings(input?.group)),

  byKey: publicQuery
    .input(z.string())
    .query(({ input }) => findSettingByKey(input)),

  upsert: adminQuery
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string(),
        group: z.string().default("general"),
        description: z.string().optional(),
      })
    )
    .mutation(({ input }) => createOrUpdateSetting(input)),

  delete: adminQuery
    .input(z.number())
    .mutation(({ input }) => deleteSetting(input)),
});
