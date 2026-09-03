import React from 'react';
import Image from 'next/image';
import { Clock, Globe, Film, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/utils';
import { VideoInfo } from '@/types/video';

interface VideoPreviewProps {
  video: VideoInfo;
}

export function VideoPreview({ video }: VideoPreviewProps) {
  return (
    <Card className="p-6 overflow-hidden border-white/10 bg-slate-900/90 shadow-2xl space-y-5">
      {/* Title & Metadata Header */}
      <div className="flex flex-col space-y-2 border-b border-white/10 pb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
          {video.title}
        </h2>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-white/10">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-mono text-slate-300">{video.sourceDomain}</span>
          </div>

          {video.duration ? (
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-white/10">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Main Full-Width Video Player & Download Action */}
      {video.sourceUrl && (
        <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black shadow-2xl">
          <div className="bg-slate-950 px-4 py-2.5 text-xs font-mono text-slate-400 border-b border-white/10 flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-200 font-semibold">Live Video Player Stream</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Right-click player to &quot;Save video as...&quot;</span>
          </div>

          <div className="relative aspect-video w-full bg-black">
            {video.sourceUrl.endsWith('.mp4') || video.sourceUrl.endsWith('.webm') ? (
              <video src={video.sourceUrl} controls className="w-full h-full object-contain" />
            ) : (
              <iframe
                src={video.sourceUrl}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            )}
          </div>

          {/* Large Action Bar Directly Below Player */}
          <div className="p-4 bg-slate-900 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0" />
              <span className="font-medium text-slate-300">Stream iFrame Player Detected</span>
            </div>
            <a
              href={`/api/proxy-download?url=${encodeURIComponent(video.sourceUrl)}&filename=${encodeURIComponent(video.title.replace(/[^a-zA-Z0-9_-]/g, '_'))}`}
              download
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto font-bold text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 rounded-xl px-8 h-12"
              >
                <Download className="h-5 w-5 mr-2" />
                <span>DOWNLOAD PLAYBACK STREAM</span>
              </Button>
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}
