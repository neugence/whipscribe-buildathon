"use me";
"use client";

import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, DollarSign, MessageSquare, Save, Check, AlertCircle } from "lucide-react";
import { getSettings, updateSettings } from "@/lib/api";
import { UserSettings } from "@/lib/api/types";
import { SkeletonLoader } from "./SkeletonLoader";

export interface SettingsFormProps {
  onSettingsSaved?: (newSettings: UserSettings) => void;
}

const TONE_OPTIONS = [
  { value: "professional", label: "Professional & Concise", desc: "Clean, business-focused tone for enterprise clients." },
  { value: "warm", label: "Warm & Friendly", desc: "Approachability-focused tone for creative freelancers & agencies." },
  { value: "technical", label: "Direct & Technical", desc: "Detailed, spec-focused tone for technical leads & developers." },
  { value: "executive", label: "Executive Summary", desc: "High-level overview focused on deliverables, timelines & ROI." },
];

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($) - US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR (€) - Euro" },
  { code: "GBP", symbol: "£", label: "GBP (£) - British Pound" },
  { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee" },
  { code: "CAD", symbol: "CA$", label: "CAD ($) - Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "AUD ($) - Australian Dollar" },
];

export const SettingsForm: React.FC<SettingsFormProps> = ({ onSettingsSaved }) => {
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [currency, setCurrency] = useState<string>("USD");
  const [messageTone, setMessageTone] = useState<string>("professional");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const data = await getSettings();
        setHourlyRate(data.hourly_rate ?? 75);
        setCurrency(data.currency || "USD");
        setMessageTone(data.message_tone || "professional");
      } catch (err: any) {
        console.error("Error loading settings:", err);
        setError("Failed to load existing settings. Default values applied.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await updateSettings({
        hourly_rate: Number(hourlyRate),
        currency,
        message_tone: messageTone,
      });

      setSavedSuccess(true);
      if (onSettingsSaved && res.settings) {
        onSettingsSaved({
          user_id: "",
          hourly_rate: res.settings.hourly_rate,
          currency: res.settings.currency,
          message_tone: res.settings.message_tone,
        });
      }
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to update settings:", err);
      setError(err.message || "Could not save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader variant="settings" />;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-border/60">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Workspace & Quote Settings</h2>
          <p className="text-xs text-muted-foreground">
            Configure default billing rates and AI response tone for automatic proposal generation.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hourly Rate & Currency */}
      <div className="p-5 rounded-xl bg-card border border-border/60 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <DollarSign className="w-4 h-4 text-primary" />
          <span>Billing & Hourly Rates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground/90">
              Hourly Rate
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-background border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Used to calculate estimates from extracted task effort levels.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground/90">
              Preferred Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-lg bg-background border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-muted-foreground">
              Currency symbol applied to quotes and client follow-ups.
            </p>
          </div>
        </div>
      </div>

      {/* Client Communication Tone */}
      <div className="p-5 rounded-xl bg-card border border-border/60 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>Client Communication Tone</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {TONE_OPTIONS.map((option) => {
            const isSelected = messageTone === option.value;
            return (
              <div
                key={option.value}
                onClick={() => setMessageTone(option.value)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${
                  isSelected
                    ? "bg-primary/10 border-primary/50 text-foreground"
                    : "bg-background/40 border-border/60 hover:bg-background/80 hover:border-border text-muted-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {option.label}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {option.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 animate-in fade-in">
            <Check className="w-4 h-4" />
            Settings saved successfully!
          </span>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all shadow-md"
        >
          {isSaving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
