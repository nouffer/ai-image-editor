import { getUploadAuthParams } from "@imagekit/next/server";
import { env } from "~/env";

export async function GET() {
  try {
    const { token, expire, signature } = getUploadAuthParams({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
    });

    return new Response(
      JSON.stringify({
        token,
        expire,
        signature,
        publicKey: env.IMAGEKIT_PUBLIC_KEY,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error generating upload auth params:", error);
    return Response.json({ status: 500, statusText: "Internal Server Error" });
  }
}
