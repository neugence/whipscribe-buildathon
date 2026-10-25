"use client";

import React, { useEffect, useState } from "react";
import { streamAgentCall } from "@/lib/api";
import { AgentProcessResponse, AgentStreamEvent } from "@/lib/api/types";
import { SkeletonLine } from "./SkeletonLoader";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface ProcessingStateProps {
  submissionId: string;
  filename?: string;
  onComplete: (result: AgentProcessResponse) => void;
}

export function ProcessingState({
  submissionId,
  filename = "client_recording.mp3",
  onComplete,
}: ProcessingStateProps) {
  const [logs, setLogs] = useState<Array<{ step: string; message: string; percent: number }>>([]);
  const [currentMessage, setCurrentMessage] = useState("Initializing Vertex AI Agent Orchestrator...");
  const [percent, setPercent] = useState(15);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const unsubscribe = streamAgentCall(
      submissionId,
      {},
      (event: AgentStreamEvent) => {
        if (!isSubscribed) return;

        if (event.type === "log") {
          setCurrentMessage(event.message);
          setPercent(event.percent);
          setLogs((prev) => [
            ...prev,
            { step: event.step, message: event.message, percent: event.percent },
          ]);
        } else if (event.type === "result" && event.result) {
          setPercent(100);
          onComplete(event.result);
        }
      },
      (err: Error) => {
        if (!isSubscribed) return;
        setError(err.message || "Processing failed. Please try again.");
      }
    );

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [submissionId, onComplete]);

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-xl bg-card border border-border space-y-6 shadow-xl">
      {/* File Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground block">
            PROCESSING RECORDING
          </span>
          <p className="text-base font-medium text-foreground truncate max-w-xs sm:max-w-md">
            {filename}
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-secondary text-foreground font-semibold">
          {percent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground transition-all duration-300 rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-xs font-mono text-muted-foreground animate-pulse">
          {currentMessage}
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Streamed Execution Logs */}
      <div className="space-y-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider block">
          Agent Workflow Logs
        </span>
        <div className="p-4 rounded-lg bg-secondary/40 border border-border/40 max-h-48 overflow-y-auto space-y-2 font-mono text-xs text-foreground/80">
          {logs.length === 0 ? (
            <div className="space-y-2">
              <SkeletonLine className="h-3 w-3/4" />
              <SkeletonLine className="h-3 w-1/2" />
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
                <span>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
