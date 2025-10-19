import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@prisma/client";
import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";
import { db } from "~/server/db";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  // Pick server based on environment; change to 'live' when using production keys
  server:
    (process.env.POLAR_SERVER as "sandbox" | "production" | undefined) ??
    "sandbox",
});

// Basic runtime checks to give clearer diagnostics when the token is missing
// or looks like the wrong type. This helps avoid ambiguous 401 errors later.
if (!env.POLAR_ACCESS_TOKEN) {
  // Throw early in dev so the misconfiguration is obvious.
  console.error(
    "[Polar] POLAR_ACCESS_TOKEN is not set. Set POLAR_ACCESS_TOKEN in your .env with a server API token.",
  );
} else {
  // Common mistake: using an OAuth/access token (polar_oat_) or other temporary token
  // instead of a server-side secret key. Warn the developer if it looks like that.
  if (
    env.POLAR_ACCESS_TOKEN.startsWith("polar_oat_") ||
    env.POLAR_ACCESS_TOKEN.startsWith("oat_")
  ) {
    console.warn(
      "[Polar] The provided POLAR_ACCESS_TOKEN appears to be an OAuth/OAT token (polar_oat_...).\n" +
        "Polar server/API calls (used to create customers) require a server API token (a server/secret key).\n" +
        "Generate a server key in the Polar dashboard (sandbox or live matching the `server` setting) and update POLAR_ACCESS_TOKEN in your .env.\n" +
        "After updating, restart the dev server.",
    );
  }
}

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "9c20e6f9-0c32-47a1-a877-d8dfdf6fb873",
              slug: "Lite",
            },
            {
              productId: "88f81aca-72c5-43ff-8d39-a8e3e1b19d0d",
              slug: "Regular",
            },
            {
              productId: "285f0a31-a5aa-4dd6-9c6f-d2b7b3ff0daa",
              slug: "Max",
            },
          ],
          successUrl: "/dashboard",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onOrderPaid: async (order) => {
            const externalCustomerId = order.data.customer.externalId;

            if (!externalCustomerId) {
              console.error("No external customer ID found.");
              throw new Error("No external customer id found.");
            }

            const productId = order.data.productId;

            let creditsToAdd = 0;

            switch (productId) {
              case "9c20e6f9-0c32-47a1-a877-d8dfdf6fb873":
                creditsToAdd = 50;
                break;
              case "88f81aca-72c5-43ff-8d39-a8e3e1b19d0d":
                creditsToAdd = 100;
                break;
              case "285f0a31-a5aa-4dd6-9c6f-d2b7b3ff0daa":
                creditsToAdd = 400;
                break;
            }

            console.log(
              `Adding ${creditsToAdd} credits to user ${externalCustomerId}`,
            );

            await db.user.update({
              where: { id: externalCustomerId },
              data: {
                credits: {
                  increment: creditsToAdd,
                },
              },
            });

            console.log(
              `Successfully added ${creditsToAdd} credits to user ${externalCustomerId}`,
            );
          },
        }),
      ],
    }),
  ],
});
