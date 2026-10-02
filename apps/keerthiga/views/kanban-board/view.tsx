import {
  ThemeProvider,
  useCallTool,
  useHostContext,
  useSendFollowUp,
  useToolContext,
  useViewTheme,
} from "mcp-use/react";
import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Flame,
  Layers,
  MessageSquare,
  Mic,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Tag,
  ThumbsUp,
  User,
  Volume2,
  Zap,
} from "lucide-react";
import "./view.css";

export interface BugItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  speaker: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  component?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  speaker: string;
  impact: "must_have" | "high_value" | "delighter";
  requestedBy: string;
  status: "planned" | "under_review" | "backlog";
}

export interface QuoteItem {
  id: string;
  quote: string;
  timestamp: string;
  speaker: string;
  sentiment: "frustrated" | "enthusiastic" | "neutral" | "insightful";
  context: string;
  tags?: string[];
}

export interface KanbanBoardData {
  title: string;
  interviewee: string;
  duration: string;
  recordedDate: string;
  summary: string;
  reportedBugs: BugItem[];
  featureRequests: FeatureItem[];
  keyQuotes: QuoteItem[];
  stats?: {
    totalBugs: number;
    totalFeatureRequests: number;
    totalQuotes: number;
    frictionScore?: string;
  };
}

// Fallback high-fidelity sample data for instant render & offline demo reliability
const DEFAULT_KANBAN_DATA: KanbanBoardData = {
  title: "Enterprise Onboarding & Billing Usability Interview",
  interviewee: "Sarah Chen (VP of Product @ FinTech Scaleup)",
  duration: "42:15",
  recordedDate: "September 22, 2026",
  summary:
    "Participant conducted an end-to-end evaluation of the new team invitation and seat provisioning workflow. Strong praise for AI transcription speed, but revealed critical friction around SSO configuration and invoice splitting.",
  stats: {
    totalBugs: 3,
    totalFeatureRequests: 3,
    totalQuotes: 4,
    frictionScore: "Medium (3 Critical Paths Blocked)",
  },
  reportedBugs: [
    {
      id: "BUG-101",
      title: "SAML SSO redirect loops infinitely on Safari 18",
      description:
        "When initiating Okta login with strict cookie privacy enabled, the OAuth callback state fails to persist, causing a 400 Bad Request error.",
      timestamp: "08:14",
      speaker: "Sarah Chen",
      severity: "critical",
      status: "open",
      component: "Auth / SSO Gateway",
    },
    {
      id: "BUG-102",
      title: "Seat count selector resets to 1 after entering billing address",
      description:
        "State synchronization error in the checkout form clears custom seat pricing tiers upon postal code autofill.",
      timestamp: "19:45",
      speaker: "Sarah Chen",
      severity: "high",
      status: "in_progress",
      component: "Stripe Billing Modal",
    },
    {
      id: "BUG-103",
      title: "Audio waveform scrub bar lags by ~1.5s during playback",
      description:
        "Canvas redraw frequency drops below 20fps when rendering transcripts longer than 30 minutes on low-power mode.",
      timestamp: "31:20",
      speaker: "Sarah Chen",
      severity: "medium",
      status: "open",
      component: "Audio Player Engine",
    },
  ],
  featureRequests: [
    {
      id: "FEAT-201",
      title: "Automated Jira & Linear ticket generation from transcript timestamps",
      description:
        "Allow PMs to select any bug in the Generative UI board and immediately sync a ticket with pre-populated audio clips and speaker quotes.",
      timestamp: "14:52",
      speaker: "Sarah Chen",
      impact: "must_have",
      requestedBy: "Product Operations & Engineering Leads",
      status: "planned",
    },
    {
      id: "FEAT-202",
      title: "Multi-workspace seat allocation & PO invoicing support",
      description:
        "Support automated PO number entry and VAT exemption validation for European enterprise entities directly inside the checkout screen.",
      timestamp: "24:10",
      speaker: "Sarah Chen",
      impact: "high_value",
      requestedBy: "Enterprise Procurement",
      status: "under_review",
    },
    {
      id: "FEAT-203",
      title: "Speaker voice-print auto-identification across recurring calls",
      description:
        "Remember repeat attendees so PMs do not have to manually re-assign speaker names on recurring sprint reviews.",
      timestamp: "38:05",
      speaker: "Sarah Chen",
      impact: "delighter",
      requestedBy: "UX Research Teams",
      status: "backlog",
    },
  ],
  keyQuotes: [
    {
      id: "QTE-301",
      quote:
        "I spent 15 minutes trying to invite my 8 engineers, but the screen kept telling me my session expired. It nearly made me abandon the trial.",
      timestamp: "09:30",
      speaker: "Sarah Chen",
      sentiment: "frustrated",
      context: "Discussing the team invitation modal friction",
      tags: ["#OnboardingDropoff", "#AuthFriction", "#UXSmell"],
    },
    {
      id: "QTE-302",
      quote:
        "The transcript accuracy for technical terms like 'gRPC' and 'Kubernetes sidecar' is the best I've seen. WhipScribe nailed the jargon.",
      timestamp: "16:40",
      speaker: "Sarah Chen",
      sentiment: "enthusiastic",
      context: "Reviewing transcript quality after audio ingestion",
      tags: ["#Accuracy", "#ProductLove", "#NPS"],
    },
    {
      id: "QTE-303",
      quote:
        "If I can click a timestamp in this board and jump straight to the audio proof during our executive readout, that saves me 4 hours of slide prep every week.",
      timestamp: "28:15",
      speaker: "Sarah Chen",
      sentiment: "insightful",
      context: "Evaluating Generative UI Kanban workflow",
      tags: ["#WorkflowEfficiency", "#ExecReadout", "#ROI"],
    },
    {
      id: "QTE-304",
      quote:
        "We need a way to split invoices across two cost centers without contacting support.",
      timestamp: "35:50",
      speaker: "Sarah Chen",
      sentiment: "neutral",
      context: "Procurement requirement review",
      tags: ["#Billing", "#EnterpriseFeature"],
    },
  ],
};

export default function WhipScribeKanbanView() {
  const view = useToolContext<"generate-kanban-board">();
  const reanalyzeTool = useCallTool("generate-kanban-board");
  const { displayMode } = useHostContext();
  const theme = useViewTheme();
  const sendFollowUp = useSendFollowUp();

  // Active board data resolution
  const activeData: KanbanBoardData = useMemo(() => {
    if (reanalyzeTool.data?.structuredContent) {
      return reanalyzeTool.data.structuredContent as unknown as KanbanBoardData;
    }
    if (view.status === "ready" && view.toolOutput) {
      return view.toolOutput as unknown as KanbanBoardData;
    }
    return DEFAULT_KANBAN_DATA;
  }, [reanalyzeTool.data, view]);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [activeAudioSnippet, setActiveAudioSnippet] = useState<{
    timestamp: string;
    speaker: string;
    text: string;
    isPlaying: boolean;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showJiraModal, setShowJiraModal] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [customInputText, setCustomInputText] = useState("");
  const [customFocusArea, setCustomFocusArea] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayAudioSnippet = (timestamp: string, speaker: string, text: string) => {
    setActiveAudioSnippet({
      timestamp,
      speaker,
      text,
      isPlaying: true,
    });
    showToast(`▶ Playing WhipScribe audio at [${timestamp}]`);
  };

  // Filter items
  const filteredBugs = useMemo(() => {
    return (activeData.reportedBugs || []).filter((bug) => {
      const matchSearch =
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bug.component && bug.component.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchSeverity =
        selectedSeverity === "all" || bug.severity === selectedSeverity;
      return matchSearch && matchSeverity;
    });
  }, [activeData.reportedBugs, searchQuery, selectedSeverity]);

  const filteredFeatures = useMemo(() => {
    return (activeData.featureRequests || []).filter((feat) => {
      return (
        feat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feat.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [activeData.featureRequests, searchQuery]);

  const filteredQuotes = useMemo(() => {
    return (activeData.keyQuotes || []).filter((q) => {
      return (
        q.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.tags && q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    });
  }, [activeData.keyQuotes, searchQuery]);

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "medium":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
    }
  };

  const getSentimentBadgeClass = (sent: string) => {
    switch (sent) {
      case "frustrated":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      case "enthusiastic":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "insightful":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20";
    }
  };

  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const topAnchorRef = React.useRef<HTMLDivElement>(null);

  // Force scroll to top on mount, ready status, and data change
  React.useEffect(() => {
    const resetScroll = () => {
      if (topAnchorRef.current) {
        topAnchorRef.current.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
      }
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();
    const t1 = setTimeout(resetScroll, 50);
    const t2 = setTimeout(resetScroll, 150);
    const t3 = setTimeout(resetScroll, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [view.status, activeData]);

  // Monitor scroll for back-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop || containerRef.current?.scrollTop || 0;
      if (scrollPos > 120) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    topAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <ThemeProvider>
      {/* 
        Explicit 100vh scroll container guarantees that mousewheel, touch, 
        and trackpad scrolling work in every iframe host environment.
      */}
      <div
        data-theme={theme}
        style={{
          height: "100vh",
          maxHeight: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
        className="font-sans-geist w-full flex flex-col bg-slate-50 px-4 sm:px-6 pb-12 text-slate-900 selection:bg-indigo-600 selection:text-white dark:bg-slate-950 dark:text-slate-100 dark:selection:bg-indigo-400 dark:selection:text-black"
      >
        {/* ========================================================================= */}
        {/* DEDICATED TOP CLEARANCE SPACER */}
        {/* Pushes content 56px below host floating overlay toolbar */}
        {/* ========================================================================= */}
        <div className="h-14 sm:h-16 w-full shrink-0" aria-hidden="true" />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 rounded-xl shadow-2xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Header / Top Hero Card */}
        <div className="glass-panel rounded-2xl p-5 sm:p-6 shadow-sm mb-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
                <Mic className="w-3.5 h-3.5" /> WhipScribe Action UI
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Clock className="w-3 h-3" /> {activeData.duration}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <User className="w-3 h-3" /> {activeData.interviewee}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeData.title}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed">
              {activeData.summary}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => setShowInputModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Paste Transcript
            </button>
            <button
              onClick={() => setShowJiraModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4" /> Sync with Jira / Linear
            </button>
            <button
              onClick={() => {
                const markdownReport = `# ${activeData.title}\n\n**Interviewee:** ${activeData.interviewee}\n**Duration:** ${activeData.duration}\n\n## Summary\n${activeData.summary}\n\n## 1. Reported Bugs\n${activeData.reportedBugs.map((b) => `- [${b.timestamp}] **${b.title}** (${b.severity}): ${b.description}`).join("\n")}\n\n## 2. Feature Requests\n${activeData.featureRequests.map((f) => `- [${f.timestamp}] **${f.title}** (${f.impact}): ${f.description}`).join("\n")}\n\n## 3. Key Quotes\n${activeData.keyQuotes.map((q) => `> "${q.quote}" — ${q.speaker} [${q.timestamp}]`).join("\n")}`;
                handleCopyText(markdownReport, "full-report");
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Copy className="w-4 h-4" /> Copy Executive Brief
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-200/60 dark:border-slate-800/80 text-xs">
          <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
            <div className="text-slate-500 dark:text-slate-400 font-medium">Bugs Detected</div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {activeData.reportedBugs?.length || 0} issues
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="text-slate-500 dark:text-slate-400 font-medium">Feature Requests</div>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              {activeData.featureRequests?.length || 0} requests
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <div className="text-slate-500 dark:text-slate-400 font-medium">Key Quotes</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {activeData.keyQuotes?.length || 0} quotes
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
            <div className="text-slate-500 dark:text-slate-400 font-medium">Friction Index</div>
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1 truncate">
              {activeData.stats?.frictionScore || "3 High Impact Points"}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bugs, features, or quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/30 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          {["all", "critical", "high", "medium"].map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
                selectedSeverity === sev
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Generative UI Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* COLUMN 1: REPORTED BUGS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <h2 className="font-bold text-sm tracking-wide uppercase text-slate-800 dark:text-slate-200">
                Reported Bugs
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {filteredBugs.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Auto-extracted</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {filteredBugs.map((bug) => (
              <div
                key={bug.id}
                className="kanban-card glass-panel rounded-2xl p-4.5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-rose-400/40 dark:hover:border-rose-500/40"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getSeverityBadgeClass(bug.severity)}`}>
                    {bug.severity}
                  </span>
                  <button
                    onClick={() => handlePlayAudioSnippet(bug.timestamp, bug.speaker, bug.title)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                    title="Click to jump to WhipScribe audio recording"
                  >
                    <Volume2 className="w-3 h-3 text-indigo-500" /> [{bug.timestamp}]
                  </button>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-1.5">
                  {bug.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {bug.description}
                </p>

                {bug.component && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono-code mb-3 bg-slate-100/60 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
                    <Layers className="w-3 h-3 text-slate-400" /> {bug.component}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/70 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> {bug.speaker}
                  </span>
                  <button
                    onClick={() => {
                      sendFollowUp({
                        prompt: `Generate a Jira bug ticket specification for issue: "${bug.title}" from timestamp [${bug.timestamp}], including reproduction steps and engineering impact.`,
                      });
                      showToast("Sent follow-up request to AI!");
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    Draft Ticket <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {filteredBugs.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No bugs match current filters.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: FEATURE REQUESTS */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
              <h2 className="font-bold text-sm tracking-wide uppercase text-slate-800 dark:text-slate-200">
                Feature Requests
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {filteredFeatures.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Prioritized</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {filteredFeatures.map((feat) => (
              <div
                key={feat.id}
                className="kanban-card glass-panel rounded-2xl p-4.5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-indigo-400/40 dark:hover:border-indigo-500/40"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {feat.impact.replace("_", " ")}
                  </span>
                  <button
                    onClick={() => handlePlayAudioSnippet(feat.timestamp, feat.speaker, feat.title)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                    title="Click to jump to WhipScribe audio recording"
                  >
                    <Volume2 className="w-3 h-3 text-indigo-500" /> [{feat.timestamp}]
                  </button>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-1.5">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {feat.description}
                </p>

                <div className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Audience:</span>{" "}
                  {feat.requestedBy}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/70 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> {feat.speaker}
                  </span>
                  <button
                    onClick={() => {
                      sendFollowUp({
                        prompt: `Create a Product Requirements Document (PRD) one-pager for feature: "${feat.title}" based on the interview context at [${feat.timestamp}].`,
                      });
                      showToast("Sent PRD generation prompt to AI!");
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    Generate PRD <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {filteredFeatures.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No feature requests match search.
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 3: KEY QUOTES */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <h2 className="font-bold text-sm tracking-wide uppercase text-slate-800 dark:text-slate-200">
                Key Quotes
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {filteredQuotes.length}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Verbatim Proof</span>
          </div>

          <div className="flex flex-col gap-3.5">
            {filteredQuotes.map((q) => (
              <div
                key={q.id}
                className="kanban-card glass-panel rounded-2xl p-4.5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-emerald-400/40 dark:hover:border-emerald-500/40"
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getSentimentBadgeClass(q.sentiment)}`}>
                    {q.sentiment}
                  </span>
                  <button
                    onClick={() => handlePlayAudioSnippet(q.timestamp, q.speaker, q.quote)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 dark:bg-slate-800/80 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/50 dark:border-slate-700/50"
                    title="Click to jump to WhipScribe audio recording"
                  >
                    <Volume2 className="w-3 h-3 text-emerald-500" /> [{q.timestamp}]
                  </button>
                </div>

                <blockquote className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 italic border-l-2 border-emerald-500 pl-3 py-1 mb-2.5 leading-relaxed">
                  "{q.quote}"
                </blockquote>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Context:</span> {q.context}
                </p>

                {q.tags && q.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {q.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/70 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> {q.speaker}
                  </span>
                  <button
                    onClick={() => handleCopyText(`"${q.quote}" — ${q.speaker} [${q.timestamp}]`, q.id)}
                    className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedId === q.id ? "Copied" : "Copy Quote"}
                  </button>
                </div>
              </div>
            ))}
            {filteredQuotes.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No quotes match search.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Interactive Audio Player Bar */}
      {activeAudioSnippet && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-40 glass-panel p-4 rounded-2xl shadow-2xl border border-indigo-500/30 dark:border-indigo-400/30 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> WhipScribe Audio Stream
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md">
                [{activeAudioSnippet.timestamp}]
              </span>
            </div>
            <button
              onClick={() => setActiveAudioSnippet(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕ Close
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setActiveAudioSnippet((prev) =>
                  prev ? { ...prev, isPlaying: !prev.isPlaying } : null
                )
              }
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform active:scale-95 shrink-0"
            >
              {activeAudioSnippet.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            <div className="flex-1">
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 italic mb-1">
                "{activeAudioSnippet.text}"
              </p>
              {/* Waveform graphic representation */}
              <div className="flex items-center gap-1 h-4">
                {[4, 10, 16, 8, 14, 12, 16, 6, 12, 15, 9, 14, 16, 7, 11, 15, 6].map(
                  (h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full bg-indigo-500/80 ${
                        activeAudioSnippet.isPlaying ? "wave-bar" : ""
                      }`}
                      style={{ height: `${h}px` }}
                    />
                  )
                )}
                <span className="text-[10px] font-mono text-slate-400 ml-2">
                  Synced to WhipScribe Master Audio
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Jira / Linear Bi-Directional Sync Modal Preview */}
      {showJiraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Sync to Jira & Linear
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track 4 Vision: Bi-directional Timestamped Workflows
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowJiraModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 mb-6">
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700">
                <span className="font-semibold text-indigo-700 dark:text-indigo-300 block mb-1">
                  ⚡ 3 Issues Ready for Direct Export:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>
                    [BUG-101] SAML SSO redirect loops infinitely <code>(08:14)</code>
                  </li>
                  <li>
                    [BUG-102] Seat count selector resets on autofill <code>(19:45)</code>
                  </li>
                  <li>
                    [FEAT-201] Automated Linear ticket generation <code>(14:52)</code>
                  </li>
                </ul>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Tickets created will include rich metadata, speaker quotes, and a direct
                deep-link to the WhipScribe audio player at the exact second of reproduction.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowJiraModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowJiraModal(false);
                  showToast("✨ Successfully exported 3 tickets with timestamp permalinks!");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
              >
                Confirm Export to Jira
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paste / Edit Custom Transcript Modal */}
      {showInputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-4xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Paste Interview Transcript
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste raw transcript text with timestamps to instantly generate an interactive Kanban board
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInputModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Transcript Text (with timestamps like [12:34]):
                </label>
                <textarea
                  rows={12}
                  placeholder={`[03:15] Alex (Lead Designer): We noticed a critical bug where clicking the checkout button causes an infinite loading spinner on Firefox.\n[07:40] Alex: I wish we had automated Slack notifications whenever a teammate approves an invoice.\n[12:20] Alex: "The transcription accuracy on WhipScribe saved us 3 hours of manual work today, it's incredible!"\n[18:05] Alex: The mobile bottom navigation bar crashes when rotating the screen to landscape.\n[22:30] Alex: We really need Figma plugin integration so our designers don't have to leave their canvas.`}
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Focus Area (optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Onboarding, Checkout & Billing, Mobile UX"
                  value={customFocusArea}
                  onChange={(e) => setCustomFocusArea(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowInputModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!customInputText.trim()) {
                    showToast("Please enter transcript text.");
                    return;
                  }
                  void reanalyzeTool.callTool({
                    transcript: customInputText.trim().split("\n"),
                    focusArea: customFocusArea.trim() || undefined,
                  });
                  setShowInputModal(false);
                  showToast("✨ Analyzing custom transcript...");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
              >
                Generate Action Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </ThemeProvider>
  );
}
