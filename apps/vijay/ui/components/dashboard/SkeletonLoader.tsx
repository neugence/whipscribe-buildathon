"use client";

import React from "react";

export function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-secondary/70 animate-pulse rounded ${className}`}
    />
  );
}

export function TranscriptSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <SkeletonLine className="h-4 w-28" />
        <SkeletonLine className="h-4 w-16" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-card/60 border border-border/40 space-y-2"
          >
            <div className="flex justify-between">
              <SkeletonLine className="h-3.5 w-20" />
              <SkeletonLine className="h-3.5 w-12" />
            </div>
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BriefSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-4 w-20" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-card/60 border border-border/40 space-y-2"
          >
            <div className="flex justify-between">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-3 w-10" />
            </div>
            <SkeletonLine className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonLine className="h-3.5 w-20" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-card/60 border border-border/40 flex items-center justify-between"
          >
            <SkeletonLine className="h-4 w-3/4" />
            <SkeletonLine className="h-4 w-8 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EstimateSkeleton() {
  return (
    <div className="p-4 rounded-lg bg-card/60 border border-border/40 flex justify-between items-center">
      <div className="space-y-2">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-6 w-20" />
      </div>
      <div className="space-y-2 text-right">
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-6 w-24" />
      </div>
    </div>
  );
}

export function RecordingsListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4].map((idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-lg bg-card/60 border border-border/40 space-y-2"
        >
          <div className="flex justify-between items-center">
            <SkeletonLine className="h-4 w-36" />
            <SkeletonLine className="h-3 w-16" />
          </div>
          <SkeletonLine className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="max-w-xl mx-auto p-6 rounded-xl bg-card/60 border border-border/40 space-y-6">
      <div className="space-y-2">
        <SkeletonLine className="h-6 w-40" />
        <SkeletonLine className="h-4 w-64" />
      </div>

      <div className="space-y-4 pt-4 border-t border-border/40">
        <div className="space-y-2">
          <SkeletonLine className="h-3.5 w-24" />
          <SkeletonLine className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-3.5 w-24" />
          <SkeletonLine className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <SkeletonLine className="h-3.5 w-24" />
          <SkeletonLine className="h-10 w-full" />
        </div>
        <SkeletonLine className="h-10 w-32 rounded-md pt-2" />
      </div>
    </div>
  );
}

export function SkeletonLoader({
  variant = "workspace",
  count,
}: {
  variant?: "transcript" | "brief" | "tasks" | "estimate" | "recordings" | "settings" | "workspace";
  count?: number;
}) {
  switch (variant) {
    case "transcript":
      return <TranscriptSkeleton />;
    case "brief":
      return <BriefSkeleton />;
    case "tasks":
      return <TasksSkeleton />;
    case "estimate":
      return <EstimateSkeleton />;
    case "recordings":
      return <RecordingsListSkeleton />;
    case "settings":
      return <SettingsSkeleton />;
    case "workspace":
    default:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          <TranscriptSkeleton />
          <BriefSkeleton />
        </div>
      );
  }
}

