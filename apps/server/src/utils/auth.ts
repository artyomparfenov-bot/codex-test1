import { parse, serialize } from "cookie";
import type { IncomingMessage } from "http";
import { env } from "./env";

const SESSION_COOKIE = "outreach_session";

export function verifyBasicAuth(authorization?: string) {
  if (!authorization?.startsWith("Basic ")) return false;
  const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
  const [email, password] = decoded.split(":");
  return email === env.ADMIN_EMAIL && password === env.ADMIN_PASSWORD;
}

export function getSession(request: IncomingMessage) {
  const cookies = request.headers.cookie ? parse(request.headers.cookie) : {};
  return cookies[SESSION_COOKIE];
}

export function createSessionCookie() {
  const value = Buffer.from(`${env.ADMIN_EMAIL}:${Date.now()}`).toString("base64");
  return serialize(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}
