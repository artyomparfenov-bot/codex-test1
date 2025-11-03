import http from "http";
import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { appRouter, createContext } from "./trpc";
import { env } from "./utils/env";
import { createSessionCookie, verifyBasicAuth } from "./utils/auth";
import { logger } from "./utils/logger";

const handler = createHTTPHandler({
  router: appRouter,
  createContext,
});

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.url === "/auth/login" && req.method === "POST") {
    if (!verifyBasicAuth(req.headers.authorization)) {
      res.statusCode = 401;
      res.end("Неверные учетные данные");
      return;
    }
    res.setHeader("Set-Cookie", createSessionCookie());
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.url?.startsWith("/trpc")) {
    handler(req, res);
    return;
  }

  res.statusCode = 404;
  res.end("Not Found");
});

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  logger.info(`tRPC сервер запущен на порту ${port}`, { env: env.NODE_ENV });
});
