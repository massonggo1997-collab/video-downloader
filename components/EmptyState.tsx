import React from 'react';
import { Film, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'No downloads yet',
  description = 'Paste a video URL on the homepage to start your first download job.',
}: EmptyStateProps) {
  return (
    <Card className="p-12 text-center border-dashed border-white/10 bg-card/30">
      <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Film className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        <a
          href="/"
          className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors pt-2"
        >
          <span>Go to Homepage</span>
          <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
        </a>
      </div>
    </Card>
  );
}
