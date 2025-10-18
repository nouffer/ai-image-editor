import React from "react";
import { env } from "~/env";

export default function Home() {
  return (
    <div className="text-5xl font-extrabold tracking-tight text-gray-600 sm:text-[5rem]">
      Home{env.BETTER_AUTH_SECRET}
    </div>
  );
}
