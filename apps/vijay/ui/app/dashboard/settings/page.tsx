"use me";
"use client";

import React from "react";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
      <SettingsForm />
    </div>
  );
}
