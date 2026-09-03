import React from 'react';
import { Zap, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative text-center py-12 md:py-16 overflow-hidden">
      {/* Glow ambient background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4">
        {/* Brand badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <Zap className="h-3.5 w-3.5" />
          <span>Universal Video Downloader</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
          Download Video <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">From URL</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
          Paste a supported video URL and analyze available media formats in high speed.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-white/5">
            <Zap className="h-4 w-4 text-blue-400" />
            <span>Fast Processing</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-white/5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Secure & Private</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-white/5">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Temporary Storage</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-card/60 border border-white/5">
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
            <span>Public HTML5 Streams</span>
          </div>
        </div>
      </div>
    </div>
  );
}
