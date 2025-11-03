import { router } from "../trpc";
import { companiesRouter } from "./companies";
import { contactsRouter } from "./contacts";
import { settingsRouter } from "./settings";
import { logsRouter } from "./logs";
import { actionsRouter } from "./actions";

export const appRouter = router({
  companies: companiesRouter,
  contacts: contactsRouter,
  settings: settingsRouter,
  logs: logsRouter,
  actions: actionsRouter,
});

export type AppRouter = typeof appRouter;
