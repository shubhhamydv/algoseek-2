import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  deviceId: string | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  const rawDeviceId = opts.req.headers["x-device-id"];
  const deviceId =
    typeof rawDeviceId === "string" && rawDeviceId.trim()
      ? rawDeviceId.trim()
      : Array.isArray(rawDeviceId) && rawDeviceId[0]?.trim()
      ? rawDeviceId[0].trim()
      : null;

  return {
    req: opts.req,
    res: opts.res,
    user,
    deviceId,
  };
}
