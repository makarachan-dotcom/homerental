import { roomRouter } from "./room-router";
import { tenantRouter } from "./tenant-router";
import { contractRouter } from "./contract-router";
import { paymentRouter } from "./payment-router";
import { expenseRouter } from "./expense-router";
import { noticeRouter } from "./notice-router";
import { meterReadingRouter } from "./meter-reading-router";
import { dashboardRouter } from "./dashboard-router";
import { qrRouter } from "./qr-router";
import { settingsRouter } from "./settings-router";
import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  room: roomRouter,
  tenant: tenantRouter,
  contract: contractRouter,
  payment: paymentRouter,
  expense: expenseRouter,
  notice: noticeRouter,
  meterReading: meterReadingRouter,
  dashboard: dashboardRouter,
  qr: qrRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
