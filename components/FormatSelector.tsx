import React from 'react';
import { VideoFormat } from '@/types/video';
import { formatBytes } from '@/lib/utils';
import { CheckCircle2, Film, Volume2 } from 'lucide-react';

interface FormatSelectorProps {
  formats: VideoFormat[];
  selectedFormatId: string;
  onSelect: (formatId: string) => void;
}

export function FormatSelector({ formats, selectedFormatId, onSelect }: FormatSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
        Available Formats & Qualities
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {formats.map((fmt) => {
          const isSelected = selectedFormatId === fmt.id;
          return (
            <div
              key={fmt.id}
              onClick={() => onSelect(fmt.id)}
              className={`cursor-pointer relative p-4 rounded-xl border transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-white/10 bg-card/60 hover:bg-card/90 hover:border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-slate-600 bg-slate-800'
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-base">
                      {fmt.quality || 'Standard'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300 border border-white/5">
                      {fmt.format}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                    {fmt.width && fmt.height ? (
                      <span>{fmt.width}x{fmt.height}</span>
                    ) : null}
                    {fmt.fileSize ? (
                      <span className="font-mono text-slate-300">{formatBytes(fmt.fileSize)}</span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex items-center space-x-1">
                {fmt.hasVideo && (
                  <span title="Contains Video" className="p-1 rounded bg-slate-800 text-slate-300">
                    <Film className="h-3.5 w-3.5" />
                  </span>
                )}
                {fmt.hasAudio && (
                  <span title="Contains Audio" className="p-1 rounded bg-slate-800 text-slate-300">
                    <Volume2 className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
