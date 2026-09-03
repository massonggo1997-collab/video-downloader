import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { JobStatus } from '@/types/download';
import { CheckCircle2, AlertCircle, Clock, Loader2, FileCheck } from 'lucide-react';

interface ProgressBarProps {
  status: JobStatus;
  progress: number;
}

export function ProgressBar({ status, progress }: ProgressBarProps) {
  const getBadge = () => {
    switch (status) {
      case 'QUEUED':
        return (
          <Badge variant="warning" className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Queued</span>
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge variant="info" className="flex items-center space-x-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="success" className="flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="outline" className="flex items-center space-x-1 border-slate-700 text-slate-400">
            <FileCheck className="w-3 h-3" />
            <span>Expired</span>
          </Badge>
        );
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center space-x-2">
          {getBadge()}
          <span className="text-slate-300">
            {status === 'PROCESSING' && `Downloading... ${progress}%`}
            {status === 'QUEUED' && 'Waiting in processing queue...'}
            {status === 'COMPLETED' && 'File ready for instant download'}
            {status === 'FAILED' && 'Job processing failed'}
            {status === 'EXPIRED' && 'Temporary storage expired'}
          </span>
        </div>
        <span className="font-mono text-blue-400">{progress}%</span>
      </div>

      <Progress value={progress} className="h-3" />
    </div>
  );
}
