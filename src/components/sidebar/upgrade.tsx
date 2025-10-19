"use client";

import { authClient } from "~/lib/auth-client";
import { Button } from "../ui/button";
import { Crown, Sparkles } from "lucide-react";

export default function Upgrade() {
  const upgradeUser = async () => {
    await authClient.checkout({
      products: [
        "9c20e6f9-0c32-47a1-a877-d8dfdf6fb873",
        "88f81aca-72c5-43ff-8d39-a8e3e1b19d0d",
        "285f0a31-a5aa-4dd6-9c6f-d2b7b3ff0daa",
      ],
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="group relative ml-2 cursor-pointer overflow-hidden border-orange-400/50 bg-gradient-to-r from-orange-400/10 to-pink-500/10 text-orange-400 transition-all duration-300 hover:border-orange-500/70 hover:bg-gradient-to-r hover:from-orange-500 hover:to-pink-600 hover:text-white hover:shadow-lg hover:shadow-orange-500/25"
      onClick={upgradeUser}
    >
      <div className="flex items-center gap-2">
        <Crown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
        <span className="font-medium">Upgrade</span>
        <Sparkles className="h-3 w-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-400/20 to-pink-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </Button>
  );
}
