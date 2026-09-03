"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ProgressBar';
import { Download, AlertCircle, RefreshCw } from 'lucide-react';
import { JobStatus } from '@/types/download';

interface DownloadCardProps {
  jobId: string;
  initialStatus?: JobStatus;
  initialProgress?: number;
  initialFileUrl?: string | null;
  title?: string;
  quality?: string;
  format?: string;
  onComplete?: (fileUrl: string) => void;
}

export function DownloadCard({
  jobId,
  initialStatus = 'QUEUED',
  initialProgress = 0,
  initialFileUrl = null,
  title = 'Processing Video',
  quality = '720p',
  format = 'MP4',
  onComplete,
}: DownloadCardProps) {
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [progress, setProgress] = useState<number>(initialProgress);
  const [fileUrl, setFileUrl] = useState<string | null>(initialFileUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'COMPLETED' || status === 'FAILED' || status === 'EXPIRED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/download/${jobId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setStatus(json.data.status);
          setProgress(json.data.progress || 0);

          if (json.data.fileUrl) {
            setFileUrl(json.data.fileUrl);
          }

          if (json.data.status === 'COMPLETED') {
            clearInterval(interval);
            if (onComplete && json.data.fileUrl) {
              onComplete(json.data.fileUrl);
            }
          } else if (json.data.status === 'FAILED') {
            clearInterval(interval);
            setErrorMessage(json.data.errorMessage || 'Processing failed on server provider.');
          }
        }
      } catch {
        // Retry silently on next interval tick
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId, status, onComplete]);

  return (
    <Card className="p-6 border-blue-500/30 bg-slate-900/90 shadow-2xl relative overflow-hidden">
      {/* Background glow when processing */}
      {status === 'PROCESSING' && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-3xl pointer-events-none" />
      )}

      <CardContent className="p-0 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
          <div>
            <h4 className="text-lg font-bold text-white line-clamp-1">{title}</h4>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono font-semibold">
                {quality}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {format}
              </span>
              <span className="text-slate-500">ID: {jobId}</span>
            </div>
          </div>
        </div>

        {/* Progress display */}
        <ProgressBar status={status} progress={progress} />

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        {status === 'COMPLETED' && fileUrl && (
          <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
            <Button variant="gradient" size="lg" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-emerald-600/20 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500">
              <Download className="h-5 w-5 mr-2" />
              <span>DOWNLOAD FILE NOW</span>
            </Button>
          </a>
        )}

        {status === 'FAILED' && (
          <Button
            variant="outline"
            size="default"
            onClick={() => window.location.reload()}
            className="w-full border-slate-700 text-slate-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
