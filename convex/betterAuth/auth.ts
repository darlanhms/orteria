import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
);

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const minimumSessionDurationSeconds = 60 * 60 * 24 * 18;

  const trustedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://orteria-git-main-darlan-hs-projects.vercel.app",
    process.env.BETTER_AUTH_URL,
  ].filter((origin): origin is string => Boolean(origin));

  return {
    appName: "Hermes Score",
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins,
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: false,
    },
    session: {
      // Keep authenticated sessions alive for at least 2.5 weeks.
      expiresIn: minimumSessionDurationSeconds,
      // Refresh active sessions daily during the valid window.
      updateAge: 60 * 60 * 24,
      disableSessionRefresh: false,
    },
    plugins: [
      convex({ authConfig })
    ],
  } satisfies BetterAuthOptions;
};

// For `auth` CLI
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
