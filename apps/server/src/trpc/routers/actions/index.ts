import { router } from "../../trpc";
import { enrichCompanyRouter } from "./enrichCompany";
import { findLprRouter } from "./findLpr";
import { generateIntroRouter } from "./generateIntro";

export const actionsRouter = router({
  enrichCompany: enrichCompanyRouter,
  findLpr: findLprRouter,
  generateIntro: generateIntroRouter,
});
