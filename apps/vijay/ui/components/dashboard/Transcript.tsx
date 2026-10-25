"use client";

import React from "react";
import { TranscriptLine } from "@/lib/api/types";
import { TranscriptSkeleton } from "./SkeletonLoader";

interface TranscriptProps {
  lines: TranscriptLine[] | null;
  activeTimestamp?: string | null;
  onTimestampClick?: (time: string) => void;
  isLoading?: boolean;
}

export function Transcript({
  lines,
  activeTimestamp,
  onTimestampClick,
  isLoading = false,
}: TranscriptProps) {
  if (isLoading) {
    return <TranscriptSkeleton />;
  }

  if (!lines || lines.length === 0) {
    return (
      <div className="p-8 text-center space-y-2 text-muted-foreground font-mono text-xs">
        <p>No transcript available for this recording.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium">
          AUDIO TRANSCRIPT
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          {lines.length} SPEECHES
        </span>
      </div>

      {/* Transcript Speeches */}
      <div className="space-y-3 font-sans">
        {lines.map((line, idx) => {
          const isSelected = activeTimestamp === line.time;

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? "bg-secondary border-foreground/40 ring-1 ring-border shadow-sm"
                  : "bg-card/40 border-border/60 hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-semibold text-foreground tracking-wide flex items-center gap-1.5">
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  )}
                  {line.speaker || "SPEAKER"}
                </span>

                <button
                  type="button"
                  onClick={() => onTimestampClick && onTimestampClick(line.time)}
                  className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${
                    isSelected
                      ? "bg-foreground text-background font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {line.time}
                </button>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                {line.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
