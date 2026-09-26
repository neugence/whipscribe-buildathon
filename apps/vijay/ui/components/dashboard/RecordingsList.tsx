"use me";
"use client";

import React, { useState } from "react";
import {
  FileAudio,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  X,
  ChevronRight,
} from "lucide-react";
import { SubmissionSummary } from "@/lib/api/types";
import { deleteSubmission } from "@/lib/api";
import { SkeletonLoader } from "./SkeletonLoader";

export interface RecordingsListProps {
  submissions: SubmissionSummary[];
  activeSubmissionId?: string | null;
  onSelectSubmission: (sub: SubmissionSummary) => void;
  onNewUploadClick: () => void;
  onRefreshSubmissions: () => void;
  isLoading?: boolean;
}

export const RecordingsList: React.FC<RecordingsListProps> = ({
  submissions,
  activeSubmissionId,
  onSelectSubmission,
  onNewUploadClick,
  onRefreshSubmissions,
  isLoading = false,
}) => {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = submissions.filter((sub) =>
    (sub.filename || sub.id).toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this recording?")) return;

    setDeletingId(id);
    try {
      await deleteSubmission(id);
      onRefreshSubmissions();
    } catch (err) {
      console.error("Failed to delete submission:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const formatTimestamp = (dateStr?: string | null) => {
    if (!dateStr) return "Recent call";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-card rounded-xl border border-border/60 overflow-hidden shadow-sm">
      {/* Drawer Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2">
          <FileAudio className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider">
            Call History ({submissions.length})
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefreshSubmissions}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNewUploadClick}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="shrink-0 p-3 border-b border-border/40">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter calls by name..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-background border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground/60"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* List items */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
        {isLoading ? (
          <SkeletonLoader variant="recordings" count={4} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground space-y-2">
            <FileAudio className="w-8 h-8 stroke-1 text-muted-foreground/40" />
            <p className="text-xs font-medium">No calls found</p>
            <p className="text-[11px] text-muted-foreground/80 max-w-[180px]">
              {search ? "No calls match your search filter." : "Upload a recording to start processing."}
            </p>
          </div>
        ) : (
          filtered.map((sub) => {
            const isActive = sub.id === activeSubmissionId;
            const isDeleting = sub.id === deletingId;
            const status = (sub.status || "completed").toLowerCase();

            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubmission(sub)}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                  isActive
                    ? "bg-primary/10 border-primary/40 text-foreground"
                    : "bg-background/40 border-border/40 hover:bg-background/80 hover:border-border text-foreground/90"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-border/40"
                    }`}
                  >
                    <FileAudio className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-medium truncate leading-tight">
                      {sub.filename || `Call ${sub.id.substring(0, 8)}`}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{formatTimestamp(sub.created_at)}</span>
                      <span>•</span>
                      <span className="capitalize flex items-center gap-1">
                        {status === "completed" && (
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                        )}
                        {status === "processing" && (
                          <Clock className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                        )}
                        {status === "failed" && (
                          <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                        )}
                        {status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDelete(e, sub.id)}
                    disabled={isDeleting}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-400 p-1 rounded transition-opacity"
                    title="Delete call"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
