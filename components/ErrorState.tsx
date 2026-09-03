import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  code?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  code = 'PROCESSING_FAILED',
  message = 'An unexpected error occurred while analyzing the URL.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="p-6 border-red-500/30 bg-red-950/20 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">
          <AlertCircle className="h-6 w-6" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-base font-bold text-white">Error</h4>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-mono uppercase">
              {code}
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>

          {onRetry && (
            <div className="pt-3">
              <Button variant="outline" size="sm" onClick={onRetry} className="border-red-500/30 text-red-300 hover:bg-red-500/10">
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
