import { db, schema } from "../src/db/client";
import { env } from "../src/utils/env";
import { logger } from "../src/utils/logger";

async function main() {
  logger.info("Запуск сидирования", { env: env.NODE_ENV });
  await db.delete(schema.enrichmentLogs);
  await db.delete(schema.contacts);
  await db.delete(schema.companies);
  await db.delete(schema.settings);

  const projects = ["DuD", "JVO", "PC"];
  const settingsPayload = projects.map((project) => ({
    project,
    key: "tone",
    value: project === "DuD" ? "Дружелюбный и экспертный" : project === "JVO" ? "Строгий и аналитичный" : "Энергичный и прямой",
  }));

  await db.insert(schema.settings).values(settingsPayload);

  const sampleCompanies = Array.from({ length: 20 }).map((_, index) => ({
    project: projects[index % projects.length]!,
    name: `Компания ${index + 1}`,
    website: index % 2 === 0 ? `https://example${index + 1}.ru` : null,
    source: "seed",
  }));

  await db.insert(schema.companies).values(sampleCompanies);
  logger.info("Сидирование завершено", { companies: sampleCompanies.length });
}

main().catch((error) => {
  logger.error("Сидирование завершилось ошибкой", { error });
  process.exit(1);
});
