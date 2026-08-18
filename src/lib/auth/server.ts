import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL ?? getSiteUrl(),
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        defaultValue: "user",
      },
      defaultImage: {
        type: "string",
        input: false,
        required: false,
      },
    },
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const existingUsers = await prisma.user.count();

          return {
            data: {
              ...user,
              role: existingUsers === 0 ? "admin" : "user",
              defaultImage: user.image ?? null,
            },
          };
        },
      },
    },
  },
  plugins: [nextCookies()],
});
