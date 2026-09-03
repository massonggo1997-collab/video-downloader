"use client"

import React, { useState } from 'react';
import { Hero } from '@/components/Hero';
import { UrlInput } from '@/components/UrlInput';
import { AnalyzeButton } from '@/components/AnalyzeButton';
import { VideoPreview } from '@/components/VideoPreview';
import { FormatSelector } from '@/components/FormatSelector';
import { DownloadButton } from '@/components/DownloadButton';
import { DownloadCard } from '@/components/DownloadCard';
import { ErrorState } from '@/components/ErrorState';
import { useToast } from '@/components/ui/use-toast';
import { VideoInfo } from '@/types/video';

export default function HomePage() {
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<string>('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [errorObj, setErrorObj] = useState<{ code: string; message: string } | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please paste a valid video URL first.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setErrorObj(null);
    setVideoInfo(null);
    setActiveJobId(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();

      if (!json.success) {
        setErrorObj({
          code: json.error?.code || 'INVALID_URL',
          message: json.error?.message || 'Failed to analyze video URL.',
        });
        toast({
          title: 'Analysis Failed',
          description: json.error?.message || 'Could not analyze video from URL.',
          variant: 'destructive',
        });
      } else {
        setVideoInfo(json.data);
        if (json.data.formats && json.data.formats.length > 0) {
          setSelectedFormatId(json.data.formats[0].id);
        }
        toast({
          title: 'Analysis Complete',
          description: `Found ${json.data.formats.length} available video format options.`,
          variant: 'success',
        });
      }
    } catch (err: any) {
      setErrorObj({
        code: 'PROCESSING_FAILED',
        message: err.message || 'Server connection error during analysis.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateDownload = async () => {
    if (!videoInfo || !selectedFormatId) return;

    const chosenFormat = videoInfo.formats.find((f) => f.id === selectedFormatId);
    setIsDownloading(true);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: videoInfo.sourceUrl,
          formatId: selectedFormatId,
          quality: chosenFormat?.quality || '720p',
          format: chosenFormat?.format || 'MP4',
          title: videoInfo.title,
          thumbnailUrl: videoInfo.thumbnail,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        toast({
          title: 'Download Failed',
          description: json.error?.message || 'Failed to initialize download job.',
          variant: 'destructive',
        });
      } else {
        setActiveJobId(json.data.id);
        toast({
          title: 'Download Queued',
          description: 'Your download job is active. Progress will update automatically.',
          variant: 'success',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Job Submission Error',
        description: err.message || 'Failed to submit download request.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <Hero />

      {/* Input Section */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAnalyze();
        }}
        className="space-y-4"
      >
        <UrlInput
          value={url}
          onChange={setUrl}
          onSubmit={handleAnalyze}
          isLoading={isAnalyzing}
        />

        <div className="flex justify-center">
          <AnalyzeButton
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            disabled={!url.trim()}
          />
        </div>
      </form>

      {/* Error state */}
      {errorObj && (
        <ErrorState
          code={errorObj.code}
          message={errorObj.message}
          onRetry={handleAnalyze}
        />
      )}

      {/* Video Preview & Player */}
      {videoInfo && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <VideoPreview video={videoInfo} />
        </div>
      )}

      {/* Active Job Progress Card */}
      {activeJobId && videoInfo && (
        <div className="pt-6 animate-in fade-in duration-500">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Active Download Progress
          </h3>
          <DownloadCard
            jobId={activeJobId}
            title={videoInfo.title}
            quality={
              videoInfo.formats.find((f) => f.id === selectedFormatId)?.quality || '720p'
            }
            format={
              videoInfo.formats.find((f) => f.id === selectedFormatId)?.format || 'MP4'
            }
          />
        </div>
      )}
    </div>
  );
}
