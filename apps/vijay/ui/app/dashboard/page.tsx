"use me";
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  FileAudio,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { ProcessingState } from "@/components/dashboard/ProcessingState";
import { ResizablePanels } from "@/components/dashboard/ResizablePanels";
import { RecordingsList } from "@/components/dashboard/RecordingsList";
import { SkeletonLoader } from "@/components/dashboard/SkeletonLoader";
import {
  getSubmissions,
  getSettings,
  uploadRecording,
  streamAgentCall,
  getSubmissionStatus,
  getCallDetails,
  getSubmissionAudio,
} from "@/lib/api";
import {
  SubmissionSummary,
  UserSettings,
  AgentStreamEvent,
  TranscriptLine,
  ProposalRequirement,
  ProposalTask,
  CallItem,
} from "@/lib/api/types";

type ViewMode = "upload" | "processing" | "workspace";

export default function DashboardPage() {
  const router = Router();
  const { isLoaded, isSignedIn } = useAuth();
  
  // Dashboard view states
  const [viewMode, setViewMode] = useState<ViewMode>("upload");
  const [showDrawer, setShowDrawer] = useState<boolean>(true);

  // Submissions & Settings Data
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [activeSubmission, setActiveSubmission] = useState<SubmissionSummary | null>(null);
  const [userSettings, setUserSettings] = useState<Partial<UserSettings>>({
    hourly_rate: 75,
    currency: "USD",
    message_tone: "professional",
  });

  // Active Processing / Workspace Data
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [streamLogs, setStreamLogs] = useState<AgentStreamEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Active Call Content Data
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([]);
  const [rawTranscriptText, setRawTranscriptText] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<(ProposalRequirement | CallItem)[]>([]);
  const [tasks, setTasks] = useState<(ProposalTask | CallItem)[]>([]);
  const [clientMessageDraft, setClientMessageDraft] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Global Loading States
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState<boolean>(true);
  const [isLoadingCallData, setIsLoadingCallData] = useState<boolean>(false);

  // Fetch initial submissions & settings
  const loadSubmissions = useCallback(async () => {
    try {
      setIsLoadingSubmissions(true);
      const data = await getSubmissions();
      setSubmissions(data || []);
      return data || [];
    } catch (err) {
      console.error("Error loading submissions:", err);
      return [];
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const data = await loadSubmissions();
      try {
        const settings = await getSettings();
        setUserSettings(settings);
      } catch (err) {
        console.error("Error loading user settings:", err);
      }

      // Auto-load latest submission into workspace if available and no submission selected
      if (data && data.length > 0 && !activeSubmissionId) {
        loadWorkspaceForSubmission(data[0]);
      }
    }

    if (isLoaded) {
      init();
    }
  }, [isLoaded, isSignedIn, loadSubmissions]);

  // Load call workspace data for a given submission
  const loadWorkspaceForSubmission = async (submission: SubmissionSummary) => {
    setActiveSubmission(submission);
    setActiveSubmissionId(submission.id);
    setIsLoadingCallData(true);
    setViewMode("workspace");

    try {
      // 1. Fetch transcript and status
      const statusRes = await getSubmissionStatus(submission.id);
      if (statusRes.transcript_lines) {
        setTranscriptLines(statusRes.transcript_lines);
      } else {
        setTranscriptLines([]);
      }

      // 2. Fetch audio URL
      try {
        const audioRes = await getSubmissionAudio(submission.id);
        setAudioUrl(audioRes.audio_url || audioRes.local_fallback || null);
      } catch (audioErr) {
        console.warn("Audio URL fetch failed:", audioErr);
        setAudioUrl(null);
      }

      // 3. Fetch call details if call exists
      if (submission.calls && submission.calls.length > 0) {
        const callId = submission.calls[0];
        setActiveCallId(callId);
        const callData = await getCallDetails(callId);

        if (callData.transcript_text) {
          setRawTranscriptText(callData.transcript_text);
        }

        // Categorize items
        if (callData.items) {
          const reqs = callData.items.filter(
            (it) => it.type === "requirement" || it.type === "requirement_item"
          );
          const tsk = callData.items.filter((it) => it.type === "task");
          const msgs = callData.items.filter((it) => it.type === "message");

          setRequirements(reqs.length > 0 ? reqs : []);
          setTasks(tsk.length > 0 ? tsk : []);
          if (msgs.length > 0) {
            setClientMessageDraft(msgs[0].text);
          }
        }
      } else {
        // Fallback default empty items
        setRequirements([]);
        setTasks([]);
        setClientMessageDraft("");
      }
    } catch (err) {
      console.error("Failed to load submission details:", err);
    } finally {
      setIsLoadingCallData(false);
    }
  };

  // Handle new file upload -> trigger SSE stream processing
  const handleFileUpload = async (file: File) => {
    setViewMode("processing");
    setIsProcessing(true);
    setProcessingError(null);
    setStreamLogs([]);

    try {
      // Step 1: Upload file to backend
      const uploadRes = await uploadRecording(file);
      const subId = uploadRes.submission_id;
      setActiveSubmissionId(subId);

      // Refresh submissions drawer list
      loadSubmissions();

      // Step 2: Connect SSE Stream for Vertex AI agent analysis
      streamAgentCall(
        subId,
        {},
        (event: AgentStreamEvent) => {
          setStreamLogs((prev) => [...prev, event]);

          if (event.type === "result" && event.result) {
            const res = event.result;
            setActiveCallId(res.call_id);

            // Populate proposal data if available
            if (res.proposal) {
              setRequirements(res.proposal.requirements || []);
              setTasks(res.proposal.tasks || []);
              setClientMessageDraft(res.proposal.client_message_draft || "");
            } else if (res.saved_items) {
              const reqs: ProposalRequirement[] = res.saved_items
                .filter((it) => it.type.includes("req"))
                .map((it) => ({
                  id: it.id,
                  text: it.text,
                  time: it.time || undefined,
                  category: "Requirement",
                }));
              const tsks: ProposalTask[] = res.saved_items
                .filter((it) => it.type.includes("task"))
                .map((it) => ({
                  id: it.id,
                  title: it.text,
                  effort: it.effort || "M",
                  time: it.time || undefined,
                }));
              setRequirements(reqs);
              setTasks(tsks);
            }
          }
        },
        (err: Error) => {
          console.error("Agent stream error:", err);
          setProcessingError(err.message || "Error processing call");
          setIsProcessing(false);
        }
      );
    } catch (err: any) {
      console.error("Upload error:", err);
      setProcessingError(err.message || "Failed to upload file to CallBrief backend.");
      setIsProcessing(false);
    }
  };

  // Reset to new upload view
  const handleNewUploadClick = () => {
    setActiveSubmission(null);
    setActiveSubmissionId(null);
    setActiveCallId(null);
    setTranscriptLines([]);
    setRawTranscriptText(null);
    setRequirements([]);
    setTasks([]);
    setClientMessageDraft("");
    setAudioUrl(null);
    setViewMode("upload");
  };

  return (
    <div className="flex-1 flex h-full min-h-0 overflow-hidden bg-background">
      {/* Sidebar Drawer: Call History */}
      <div
        className={`transition-all duration-300 ease-in-out border-r border-border/60 bg-muted/10 ${
          showDrawer ? "w-80" : "w-0"
        } flex flex-col h-full min-h-0 overflow-hidden shrink-0`}
      >
        <RecordingsList
          submissions={submissions}
          activeSubmissionId={activeSubmissionId}
          onSelectSubmission={loadWorkspaceForSubmission}
          onNewUploadClick={handleNewUploadClick}
          onRefreshSubmissions={loadSubmissions}
          isLoading={isLoadingSubmissions}
        />
      </div>

      {/* Main Workspace Stage */}
      <div className="flex-1 flex flex-col min-w-0 h-full min-h-0 overflow-hidden relative">
        {/* Workspace Sub-header controls */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              title={showDrawer ? "Collapse history drawer" : "Expand history drawer"}
            >
              {showDrawer ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                {activeSubmission
                  ? activeSubmission.filename || `Call ${activeSubmission.id.substring(0, 8)}`
                  : "CallBrief Workspace"}
              </span>

              {viewMode === "workspace" && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="w-2.5 h-2.5" /> Ready
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode !== "upload" && (
              <button
                onClick={handleNewUploadClick}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Call</span>
              </button>
            )}
          </div>
        </div>

        {/* View Mode Router */}
        <div className="flex-1 overflow-hidden relative">
          {viewMode === "upload" && (
            <div className="h-full flex items-center justify-center p-6 overflow-y-auto">
              <FileUpload
                onUploadSuccess={async (subId, filename) => {
                  setActiveSubmissionId(subId);
                  setViewMode("processing");
                  await loadSubmissions();
                }}
              />
            </div>
          )}

          {viewMode === "processing" && activeSubmissionId && (
            <div className="h-full flex items-center justify-center p-6 overflow-y-auto">
              <ProcessingState
                submissionId={activeSubmissionId}
                onComplete={async (result) => {
                  setIsProcessing(false);
                  const sub: SubmissionSummary = {
                    id: activeSubmissionId,
                    filename: activeSubmission?.filename || "Recording",
                    source_type: "audio_file",
                    source_location: "",
                    status: "completed",
                    transcript_job_id: null,
                    created_at: new Date().toISOString(),
                    has_transcript: true,
                    calls: [result.call_id],
                  };
                  await loadWorkspaceForSubmission(sub);
                  await loadSubmissions();
                }}
              />
            </div>
          )}

          {viewMode === "workspace" && (
            isLoadingCallData ? (
              <div className="h-full p-6">
                <SkeletonLoader variant="workspace" />
              </div>
            ) : (
              <ResizablePanels
                transcriptLines={transcriptLines}
                rawTranscriptText={rawTranscriptText}
                requirements={requirements}
                tasks={tasks}
                settings={userSettings}
                callId={activeCallId || undefined}
                clientMessageDraft={clientMessageDraft}
                audioUrl={audioUrl}
                onRequirementsChange={(newReqs) => setRequirements(newReqs)}
                onTasksChange={(newTasks) => setTasks(newTasks)}
                onSettingsRedirect={() => router.push("/dashboard/settings")}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

// Router helper wrapper
function Router() {
  return useRouter();
}
