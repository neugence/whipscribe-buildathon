"use me";
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  DollarSign,
  Clock,
  Copy,
  Check,
  Send,
  Calculator,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import { ProposalTask, CallItem, UserSettings, ProposalRequirement } from "@/lib/api/types";

export interface EstimateProps {
  tasks: (ProposalTask | CallItem)[];
  requirements?: (ProposalRequirement | CallItem)[];
  settings?: Partial<UserSettings>;
  clientMessageDraft?: string;
  onUpdateSettingsRedirect?: () => void;
}

const EFFORT_HOURS: Record<string, number> = {
  S: 1,
  M: 3,
  L: 8,
  XL: 16,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  CAD: "CA$",
  AUD: "A$",
};

export const Estimate: React.FC<EstimateProps> = ({
  tasks,
  requirements = [],
  settings,
  clientMessageDraft,
  onUpdateSettingsRedirect,
}) => {
  const [copied, setCopied] = useState(false);
  const [showDraftPreview, setShowDraftPreview] = useState(true);

  const hourlyRate = settings?.hourly_rate ?? 75;
  const currencyCode = (settings?.currency || "USD").toUpperCase();
  const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || "$";

  // Calculate total hours from tasks
  const totalHours = tasks.reduce((sum, task) => {
    if ((task as ProposalTask).estimated_hours) {
      return sum + ((task as ProposalTask).estimated_hours || 0);
    }
    const effortKey = ((task.effort as string) || "M").toUpperCase();
    return sum + (EFFORT_HOURS[effortKey] ?? 3);
  }, 0);

  const totalCost = totalHours * hourlyRate;

  // Generate clean client draft text if not directly provided by agent
  const generateClientDraft = () => {
    if (clientMessageDraft && clientMessageDraft.trim().length > 0) {
      return clientMessageDraft;
    }

    let text = `Hi there!\n\nThanks for taking the time to speak today. Based on our call, here is the summarized scope of work and estimated turnaround:\n\n`;

    if (requirements.length > 0) {
      text += `📋 Key Requirements:\n`;
      requirements.forEach((req) => {
        text += `• ${req.text}\n`;
      });
      text += `\n`;
    }

    if (tasks.length > 0) {
      text += `🛠️ Action Items & Scope:\n`;
      tasks.forEach((t) => {
        const title = (t as ProposalTask).title || (t as CallItem).text || "";
        const eff = ((t.effort as string) || "M").toUpperCase();
        text += `• ${title} (${eff} - ~${EFFORT_HOURS[eff] || 3}h)\n`;
      });
      text += `\n`;
    }

    text += `⏱️ Estimated Duration: ~${totalHours} total hours\n`;
    text += `💰 Estimated Investment: ${currencySymbol}${totalCost.toLocaleString()} (${currencySymbol}${hourlyRate}/hr)\n\n`;
    text += `Please let me know if this looks good to you, and we can get started right away!`;

    return text;
  };

  const draftText = generateClientDraft();

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              Project Estimate & Quote
            </h3>
            <p className="text-xs text-muted-foreground">
              Calculated based on {hourlyRate} {currencyCode}/hr rate
            </p>
          </div>
        </div>

        {onUpdateSettingsRedirect && (
          <button
            onClick={onUpdateSettingsRedirect}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Adjust Rate
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-background/60 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Total Estimated Hours</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {totalHours} <span className="text-xs font-normal text-muted-foreground">hrs</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-background/60 to-purple-500/5 border border-primary/20 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Estimated Cost</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {currencySymbol}
              {totalCost.toLocaleString()}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({currencySymbol}
                {hourlyRate}/h)
              </span>
            </div>
          </div>
        </div>

        {/* Client Message Draft Section */}
        <div className="rounded-xl border border-border/60 bg-background/50 overflow-hidden space-y-0">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border/40">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-foreground">
                Client-Ready Scope & Quote Draft
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDraft}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDraftPreview(!showDraftPreview)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                {showDraftPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {showDraftPreview && (
            <div className="p-4 space-y-3">
              <div className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-4 rounded-lg border border-border/40 select-all custom-scrollbar max-h-72 overflow-y-auto font-sans [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_h1]:text-sm [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-xs [&_h2]:font-bold [&_h2]:my-1.5 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:my-1 [&_p]:my-1.5 [&_li]:my-0.5 [&_code]:bg-muted/80 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_strong]:font-semibold [&_strong]:text-foreground">
                <ReactMarkdown>{draftText}</ReactMarkdown>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Ready to send directly to your client
                </span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(draftText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Send on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
