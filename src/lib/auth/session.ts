import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { cache } from "react";

import { auth } from "./server";
import type { SessionUser } from "./types";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const { id, name, email, image, role } = session.user;
  const defaultImage = (session.user as { defaultImage?: string | null })
    .defaultImage;

  return {
    id,
    name,
    email,
    image,
    defaultImage,
    role: role === "admin" ? "admin" : "user",
  };
});

export async function requireUser(locale: string): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/${locale}/auth`);
  }

  return user;
}

export async function requireAdmin(locale: string): Promise<SessionUser> {
  const user = await requireUser(locale);

  if (user.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  return user;
}
