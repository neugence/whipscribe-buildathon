"use me";
"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Edit3, Save, X, Plus, AlertCircle, ClipboardList } from "lucide-react";
import { ProposalRequirement, CallItem } from "@/lib/api/types";
import { updateItem } from "@/lib/api";

export interface BriefProps {
  requirements: (ProposalRequirement | CallItem)[];
  callId?: string;
  onSeekTimestamp?: (seconds: number) => void;
  onRequirementsChange?: (newRequirements: (ProposalRequirement | CallItem)[]) => void;
  isLoading?: boolean;
}

export const Brief: React.FC<BriefProps> = ({
  requirements: initialRequirements,
  callId,
  onSeekTimestamp,
  onRequirementsChange,
  isLoading = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [items, setItems] = useState<(ProposalRequirement | CallItem)[]>(initialRequirements);
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("Requirement");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Sync props if initialRequirements change
  React.useEffect(() => {
    setItems(initialRequirements);
  }, [initialRequirements]);

  const parseTimeToSeconds = (timeStr?: string | null): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const handleStartEdit = (item: ProposalRequirement | CallItem, idx: number) => {
    const id = (item as CallItem).id || item.id || `req-${idx}`;
    setEditingId(id);
    setEditText((item as any).text || "");
  };

  const handleSaveEdit = async (item: ProposalRequirement | CallItem, idx: number) => {
    const itemId = (item as CallItem).id;
    const updatedText = editText.trim();
    if (!updatedText) return;

    if (itemId && callId) {
      setUpdatingId(itemId);
      try {
        await updateItem(itemId, { text: updatedText, status: "edited" });
      } catch (err) {
        console.error("Failed to update item backend:", err);
      } finally {
        setUpdatingId(null);
      }
    }

    const nextItems = items.map((it, i) => {
      if (i === idx) {
        return { ...it, text: updatedText };
      }
      return it;
    });

    setItems(nextItems);
    setEditingId(null);
    if (onRequirementsChange) onRequirementsChange(nextItems);
  };

  const handleAddRequirement = () => {
    if (!newText.trim()) return;
    const newItem: ProposalRequirement = {
      id: `custom-${Date.now()}`,
      category: newCategory,
      text: newText.trim(),
    };
    const nextItems = [...items, newItem];
    setItems(nextItems);
    setNewText("");
    setIsAdding(false);
    if (onRequirementsChange) onRequirementsChange(nextItems);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              Key Requirements & Intent
            </h3>
            <p className="text-xs text-muted-foreground">
              {items.length} requirement{items.length === 1 ? "" : "s"} extracted from call
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom
          </button>
        )}
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {isAdding && (
          <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">New Requirement</span>
              <button
                onClick={() => setIsAdding(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="e.g. Client needs multi-tenant user authentication with SSO support"
              className="w-full text-xs p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none h-18"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRequirement}
                disabled={!newText.trim()}
                className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                Save Requirement
              </button>
            </div>
          </div>
        )}

        {items.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
            <AlertCircle className="w-8 h-8 stroke-1 text-muted-foreground/50" />
            <p className="text-sm font-medium">No requirements identified yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Upload a client recording to automatically extract requirements or add them manually.
            </p>
          </div>
        ) : (
          items.map((req, idx) => {
            const reqId = (req as CallItem).id || req.id || `req-${idx}`;
            const isEditing = editingId === reqId;
            const category = (req as ProposalRequirement).category || "Scope Item";
            const timeLink = (req as any).time || (req as CallItem).timestamp_link || null;
            const isUpdating = updatingId === reqId;

            return (
              <div
                key={reqId}
                className="group relative flex flex-col p-3.5 rounded-xl bg-background/50 border border-border/60 hover:border-border hover:bg-background/80 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-emerald-500 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/40 uppercase tracking-wider">
                        {category}
                      </span>

                      <div className="flex items-center gap-2">
                        {timeLink && onSeekTimestamp && (
                          <button
                            onClick={() => onSeekTimestamp(parseTimeToSeconds(timeLink))}
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-primary/10"
                            title="Jump to audio timestamp"
                          >
                            <Clock className="w-3 h-3 text-primary/70" />
                            <span>{timeLink}</span>
                          </button>
                        )}

                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(req, idx)}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground p-1 transition-opacity"
                            title="Edit requirement"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg bg-background border border-primary/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-16"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-muted-foreground hover:text-foreground text-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSaveEdit(req, idx)}
                            disabled={isUpdating}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-foreground/90 leading-relaxed font-normal">
                        {req.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
