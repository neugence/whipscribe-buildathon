"use client";

import React, { useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { FileText, ClipboardList, ListTodo, Calculator, GripVertical, Mic, AlertCircle } from "lucide-react";
import { Transcript } from "./Transcript";
import { Brief } from "./Brief";
import { Tasks } from "./Tasks";
import { Estimate } from "./Estimate";
import { TranscriptLine, ProposalRequirement, ProposalTask, CallItem, UserSettings } from "@/lib/api/types";

export interface ResizablePanelsProps {
  transcriptLines?: TranscriptLine[] | null;
  rawTranscriptText?: string | null;
  requirements?: (ProposalRequirement | CallItem)[];
  tasks?: (ProposalTask | CallItem)[];
  settings?: Partial<UserSettings>;
  callId?: string;
  clientMessageDraft?: string;
  audioUrl?: string | null;
  onSeekTimestamp?: (seconds: number) => void;
  onRequirementsChange?: (reqs: (ProposalRequirement | CallItem)[]) => void;
  onTasksChange?: (tasks: (ProposalTask | CallItem)[]) => void;
  onSettingsRedirect?: () => void;
  onRegenerate?: () => void;
}

type TabType = "brief" | "tasks" | "estimate";
type MobileTabType = "transcript" | "brief" | "tasks" | "estimate";

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  transcriptLines = [],
  rawTranscriptText,
  requirements = [],
  tasks = [],
  settings,
  callId,
  clientMessageDraft,
  audioUrl,
  onSeekTimestamp,
  onRequirementsChange,
  onTasksChange,
  onSettingsRedirect,
  onRegenerate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("brief");
  const [mobileTab, setMobileTab] = useState<MobileTabType>("transcript");
  const [activeSeconds, setActiveSeconds] = useState<number | null>(null);

  const hasAnalysis = requirements.length > 0 || tasks.length > 0;

  const parseTimeToSeconds = (timeStr?: string | null): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map((p) => parseInt(p, 10));
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const handleSeek = (seconds: number) => {
    setActiveSeconds(seconds);
    if (onSeekTimestamp) {
      onSeekTimestamp(seconds);
    }
  };

  // ── Inner components defined before return ──────────────────────────────

  const EmptyAnalysisState = () => (
    <div className="h-full flex flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-amber-400" />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <p className="text-sm font-semibold text-foreground">Brief not generated yet</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The transcript is ready but the brief, tasks and quote haven&apos;t been
          generated. Click below to run the analysis now.
        </p>
      </div>
      {onRegenerate ? (
        <button
          onClick={onRegenerate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
        >
          <Mic className="w-4 h-4" />
          Generate Brief
        </button>
      ) : null}
    </div>
  );

  const RightPanelContent = () => (
    <div className="h-full pl-2 flex flex-col space-y-3">
      {!hasAnalysis ? (
        <EmptyAnalysisState />
      ) : (
        <>
          {/* Responsive Dropdown Selector (small screens) */}
          <div className="lg:hidden flex items-center justify-between p-2 bg-muted/40 border border-border/60 rounded-xl gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground px-1">
              {activeTab === "brief" && <ClipboardList className="w-4 h-4 text-emerald-400 shrink-0" />}
              {activeTab === "tasks" && <ListTodo className="w-4 h-4 text-blue-400 shrink-0" />}
              {activeTab === "estimate" && <Calculator className="w-4 h-4 text-purple-400 shrink-0" />}
              <span className="truncate font-mono uppercase text-[11px] text-muted-foreground">Section:</span>
            </div>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              className="flex-1 bg-background border border-border/60 text-foreground text-xs font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="brief">Brief &amp; Requirements ({requirements.length})</option>
              <option value="tasks">Tasks ({tasks.length})</option>
              <option value="estimate">Estimate &amp; Quote</option>
            </select>
          </div>

          {/* Compact Horizontal Tab Navigation Header (large screens) */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-muted/40 border border-border/60 rounded-xl">
            <button
              onClick={() => setActiveTab("brief")}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeTab === "brief"
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Brief ({requirements.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeTab === "tasks"
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Tasks ({tasks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("estimate")}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeTab === "estimate"
                  ? "bg-background text-foreground shadow-sm border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Calculator className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Estimate &amp; Quote</span>
            </button>
          </div>


          {/* Tab Active Content Panel */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "brief" && (
              <Brief
                requirements={requirements}
                callId={callId}
                onSeekTimestamp={handleSeek}
                onRequirementsChange={onRequirementsChange}
              />
            )}
            {activeTab === "tasks" && (
              <Tasks
                tasks={tasks}
                callId={callId}
                onSeekTimestamp={handleSeek}
                onTasksChange={onTasksChange}
              />
            )}
            {activeTab === "estimate" && (
              <Estimate
                tasks={tasks}
                requirements={requirements}
                settings={settings}
                clientMessageDraft={clientMessageDraft}
                onUpdateSettingsRedirect={onSettingsRedirect}
              />
            )}
          </div>
        </>
      )}
    </div>
  );

  // ── Main render ─────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Mobile Tab Bar Header */}
      <div className="md:hidden flex items-center justify-around border-b border-border/60 bg-muted/30 p-1.5 gap-1">
        <button
          onClick={() => setMobileTab("transcript")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${mobileTab === "transcript"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Transcript</span>
        </button>
        <button
          onClick={() => setMobileTab("brief")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${mobileTab === "brief"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Brief</span>
        </button>
        <button
          onClick={() => setMobileTab("tasks")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${mobileTab === "tasks"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <ListTodo className="w-3.5 h-3.5" />
          <span>Tasks</span>
        </button>
        <button
          onClick={() => setMobileTab("estimate")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-colors ${mobileTab === "estimate"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Estimate</span>
        </button>
      </div>

      {/* Mobile View Container */}
      <div className="md:hidden flex-1 overflow-hidden p-3">
        {mobileTab === "transcript" && (
          <Transcript
            lines={transcriptLines}
            onTimestampClick={(t) => handleSeek(parseTimeToSeconds(t))}
          />
        )}
        {(mobileTab === "brief" || mobileTab === "tasks" || mobileTab === "estimate") && !hasAnalysis ? (
          <EmptyAnalysisState />
        ) : (
          <>
            {mobileTab === "brief" && (
              <Brief
                requirements={requirements}
                callId={callId}
                onSeekTimestamp={handleSeek}
                onRequirementsChange={onRequirementsChange}
              />
            )}
            {mobileTab === "tasks" && (
              <Tasks
                tasks={tasks}
                callId={callId}
                onSeekTimestamp={handleSeek}
                onTasksChange={onTasksChange}
              />
            )}
            {mobileTab === "estimate" && (
              <Estimate
                tasks={tasks}
                requirements={requirements}
                settings={settings}
                clientMessageDraft={clientMessageDraft}
                onUpdateSettingsRedirect={onSettingsRedirect}
              />
            )}
          </>
        )}
      </div>

      {/* Desktop Resizable 2-Column Panel Layout */}
      <div className="hidden md:flex flex-1 overflow-hidden p-4">
        <Group orientation="horizontal" className="w-full h-full rounded-xl overflow-hidden">
          {/* Left Panel: Transcript */}
          <Panel defaultSize={48} minSize={30} maxSize={70} className="h-full">
            <div className="h-full pr-2">
              <Transcript
                lines={transcriptLines}
                onTimestampClick={(t) => handleSeek(parseTimeToSeconds(t))}
              />
            </div>
          </Panel>

          {/* Resize Separator */}
          <Separator className="w-2.5 flex items-center justify-center group focus:outline-none cursor-col-resize">
            <div className="w-1 h-12 rounded-full bg-border/60 group-hover:bg-primary/60 group-active:bg-primary transition-colors flex items-center justify-center">
              <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Separator>

          {/* Right Panel: Workspace */}
          <Panel defaultSize={52} minSize={30} maxSize={70} className="h-full">
            <RightPanelContent />
          </Panel>
        </Group>
      </div>
    </div>
  );
};
