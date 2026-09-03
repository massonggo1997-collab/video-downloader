import React from 'react';
import Image from 'next/image';
import { Clock, Globe, Film } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDuration } from '@/lib/utils';
import { VideoInfo } from '@/types/video';

interface VideoPreviewProps {
  video: VideoInfo;
}

export function VideoPreview({ video }: VideoPreviewProps) {
  return (
    <Card className="p-6 overflow-hidden border-white/10 bg-card/80">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Thumbnail preview */}
        <div className="relative w-full md:w-64 h-40 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0 group">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Film className="h-10 w-10 mb-2" />
              <span className="text-xs">No Preview</span>
            </div>
          )}

          {/* Duration overlay badge */}
          {video.duration ? (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[11px] font-mono text-white flex items-center space-x-1">
              <Clock className="h-3 w-3 text-blue-400" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          ) : null}
        </div>

        {/* Info details */}
        <div className="flex-1 space-y-3 text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-bold text-white line-clamp-2 leading-snug">
            {video.title}
          </h2>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-white/5">
              <Globe className="h-3.5 w-3.5 text-blue-400" />
              <span className="font-mono text-slate-300">{video.sourceDomain}</span>
            </div>

            {video.duration ? (
              <div className="flex items-center space-x-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-white/5">
                <Clock className="h-3.5 w-3.5 text-indigo-400" />
                <span>{formatDuration(video.duration)}</span>
              </div>
            ) : null}
          </div>

          {/* Interactive Player Preview & Playback Stream */}
          {video.sourceUrl && (
            <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-slate-950 mt-4 shadow-xl text-left">
              <div className="bg-slate-900/90 px-4 py-2 text-xs font-mono text-slate-400 border-b border-white/10 flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-200 font-semibold">Interactive Video Player</span>
                </span>
                <span className="text-[11px] text-slate-400">Right-click &quot;Save video as...&quot;</span>
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
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
