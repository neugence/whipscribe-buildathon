"use me";
"use client";

import React from "react";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="flex-1 w-full overflow-y-auto p-4 sm:p-8">
      <div className="max-w-4xl mx-auto pb-16 space-y-8">
        <SettingsForm />
      </div>
    </div>
  );
}
