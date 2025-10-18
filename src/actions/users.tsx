"use server";

import { auth } from "~/lib/auth";
import { headers } from "next/headers";
import { db } from "~/server/db";

export async function getUserCredits(): Promise<number | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) return null;

    const user = await db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { credits: true },
    });

    return user.credits;
  } catch (error) {
    console.error("Failed to get user credits:", error);
    return null;
  }
}
