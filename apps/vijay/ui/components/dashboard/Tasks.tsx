"use me";
"use client";

import React, { useState } from "react";
import { CheckSquare, Clock, Plus, Trash2, Edit2, Check, X, ListTodo, AlertCircle } from "lucide-react";
import { ProposalTask, CallItem } from "@/lib/api/types";
import { updateItem } from "@/lib/api";

export interface TasksProps {
  tasks: (ProposalTask | CallItem)[];
  callId?: string;
  onSeekTimestamp?: (seconds: number) => void;
  onTasksChange?: (newTasks: (ProposalTask | CallItem)[]) => void;
  isLoading?: boolean;
}

const EFFORT_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  S: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", label: "1 hr" },
  M: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "3 hrs" },
  L: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "8 hrs" },
  XL: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20", label: "16+ hrs" },
};

export const Tasks: React.FC<TasksProps> = ({
  tasks: initialTasks,
  callId,
  onSeekTimestamp,
  onTasksChange,
  isLoading = false,
}) => {
  const [items, setItems] = useState<(ProposalTask | CallItem)[]>(initialTasks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editEffort, setEditEffort] = useState("M");
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEffort, setNewEffort] = useState("M");

  React.useEffect(() => {
    setItems(initialTasks);
  }, [initialTasks]);

  const parseTimeToSeconds = (timeStr?: string | null): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const handleStartEdit = (task: ProposalTask | CallItem, idx: number) => {
    const id = (task as CallItem).id || task.id || `task-${idx}`;
    setEditingId(id);
    setEditTitle((task as ProposalTask).title || (task as CallItem).text || "");
    setEditEffort((task.effort as string) || "M");
  };

  const handleSaveEdit = async (task: ProposalTask | CallItem, idx: number) => {
    const taskId = (task as CallItem).id;
    const updatedTitle = editTitle.trim();
    if (!updatedTitle) return;

    if (taskId && callId) {
      try {
        await updateItem(taskId, { text: updatedTitle, status: "edited" });
      } catch (err) {
        console.error("Failed to update task in API:", err);
      }
    }

    const nextTasks = items.map((it, i) => {
      if (i === idx) {
        return {
          ...it,
          title: updatedTitle,
          text: updatedTitle,
          effort: editEffort,
        };
      }
      return it;
    });

    setItems(nextTasks);
    setEditingId(null);
    if (onTasksChange) onTasksChange(nextTasks);
  };

  const handleDeleteTask = async (task: ProposalTask | CallItem, idx: number) => {
    const taskId = (task as CallItem).id;
    if (taskId && callId) {
      try {
        await updateItem(taskId, { status: "deleted" });
      } catch (err) {
        console.error("Failed to delete task in API:", err);
      }
    }

    const nextTasks = items.filter((_, i) => i !== idx);
    setItems(nextTasks);
    if (onTasksChange) onTasksChange(nextTasks);
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const newTask: ProposalTask = {
      id: `custom-task-${Date.now()}`,
      title: newTitle.trim(),
      effort: newEffort,
    };

    const nextTasks = [...items, newTask];
    setItems(nextTasks);
    setNewTitle("");
    setIsAdding(false);
    if (onTasksChange) onTasksChange(nextTasks);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              Actionable Tasks
            </h3>
            <p className="text-xs text-muted-foreground">
              {items.length} task{items.length === 1 ? "" : "s"} generated for estimate
            </p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Task
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {isAdding && (
          <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-primary">New Action Item</span>
              <button
                onClick={() => setIsAdding(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Set up OAuth credentials & Webhook handler"
              className="w-full text-xs p-2.5 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              autoFocus
            />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">Effort:</span>
                {(["S", "M", "L", "XL"] as const).map((eff) => (
                  <button
                    key={eff}
                    onClick={() => setNewEffort(eff)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors ${
                      newEffort === eff
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border/40 hover:text-foreground"
                    }`}
                  >
                    {eff}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTitle.trim()}
                  className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 && !isAdding ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-2">
            <AlertCircle className="w-8 h-8 stroke-1 text-muted-foreground/50" />
            <p className="text-sm font-medium">No tasks added yet</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Action items generated from client calls will appear here.
            </p>
          </div>
        ) : (
          items.map((task, idx) => {
            const taskId = (task as CallItem).id || task.id || `task-${idx}`;
            const title = (task as ProposalTask).title || (task as CallItem).text || "";
            const effortKey = ((task.effort as string) || "M").toUpperCase();
            const effortStyle = EFFORT_COLORS[effortKey] || EFFORT_COLORS.M;
            const timeLink = (task as any).time || (task as CallItem).timestamp_link || null;
            const isEditing = editingId === taskId;

            return (
              <div
                key={taskId}
                className="group relative flex items-start gap-3 p-3.5 rounded-xl bg-background/50 border border-border/60 hover:border-border hover:bg-background/80 transition-all"
              >
                <div className="mt-0.5 text-muted-foreground/60 flex-shrink-0">
                  <CheckSquare className="w-4 h-4 text-primary/70" />
                </div>

                <div className="flex-1 space-y-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg bg-background border border-primary/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {(["S", "M", "L", "XL"] as const).map((eff) => (
                            <button
                              key={eff}
                              onClick={() => setEditEffort(eff)}
                              className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${
                                editEffort === eff
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-muted text-muted-foreground border-border/40"
                              }`}
                            >
                              {eff}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSaveEdit(task, idx)}
                            className="p-1 text-primary hover:text-primary/80"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                        {title}
                      </p>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Effort Badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${effortStyle.bg} ${effortStyle.text} ${effortStyle.border}`}
                          title={`Effort level ${effortKey} (~${effortStyle.label})`}
                        >
                          {effortKey} ({effortStyle.label})
                        </span>

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

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleStartEdit(task, idx)}
                            className="text-muted-foreground hover:text-foreground p-1"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task, idx)}
                            className="text-muted-foreground hover:text-rose-400 p-1"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
