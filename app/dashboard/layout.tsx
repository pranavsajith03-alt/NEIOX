"use client";

import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We acknowledge that 'profiles.full_name' doesn't exist in your Supabase schema yet.
  // This bypasses the null profile crash and forces Next.js to render your intern page layout safely.
  return (
    <div className="w-full min-h-screen bg-neiox-surface">
      {children}
    </div>
  );
}