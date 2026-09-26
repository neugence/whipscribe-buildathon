"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { uploadRecording } from "@/lib/api";
import { SourceType } from "@/lib/api/types";
import { Upload, FileAudio, AlertCircle, X } from "lucide-react";

interface FileUploadProps {
  onUploadSuccess: (submissionId: string, filename: string) => void;
  onCancel?: () => void;
}

export function FileUpload({ onUploadSuccess, onCancel }: FileUploadProps) {
  const [sourceType, setSourceType] = useState<SourceType>("audio_file");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setIsUploading(true);

      try {
        const res = await uploadRecording(file, sourceType);
        setIsUploading(false);
        onUploadSuccess(res.submission_id, res.filename || file.name);
      } catch (err: unknown) {
        setIsUploading(false);
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to upload audio file. Please try again.";
        setError(msg);
      }
    },
    [sourceType, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"],
        "video/*": [".mp4", ".webm", ".mov"],
      },
      maxFiles: 1,
      maxSize: 100 * 1024 * 1024, // 100MB
    });

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-xl bg-card border border-border space-y-6 shadow-xl relative">
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      )}

      <div className="space-y-1.5 text-center">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          Upload Client Recording
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload a call recording, WhatsApp voice note, or exported audio to generate project briefs.
        </p>
      </div>

      {/* Source Type Selector */}
      <div className="flex items-center justify-center gap-2 p-1 rounded-lg bg-secondary/60 border border-border text-xs font-mono">
        <button
          type="button"
          onClick={() => setSourceType("audio_file")}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
            sourceType === "audio_file"
              ? "bg-foreground text-background font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Audio File
        </button>
        <button
          type="button"
          onClick={() => setSourceType("voice_note")}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
            sourceType === "voice_note"
              ? "bg-foreground text-background font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Voice Note
        </button>
        <button
          type="button"
          onClick={() => setSourceType("chat_export")}
          className={`flex-1 py-1.5 px-3 rounded-md transition-all ${
            sourceType === "chat_export"
              ? "bg-foreground text-background font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Chat Export
        </button>
      </div>

      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`p-8 rounded-lg border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center space-y-4 ${
          isDragActive
            ? "border-foreground bg-secondary/80 scale-[0.99]"
            : "border-border/80 bg-secondary/30 hover:bg-secondary/50 hover:border-border"
        }`}
      >
        <input {...getInputProps()} />

        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground border border-border/60">
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={20} />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {isUploading
              ? "Uploading audio recording..."
              : isDragActive
              ? "Drop recording here..."
              : "Drag & drop recording here, or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            Supported formats: MP3, WAV, M4A, AAC, MP4 (Max 100MB)
          </p>
        </div>
      </div>

      {/* Error Displays */}
      {(error || fileRejections.length > 0) && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs font-sans flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            {error ||
              "File rejected. Please ensure it is a valid audio/video file under 100MB."}
          </span>
        </div>
      )}
    </div>
  );
}
