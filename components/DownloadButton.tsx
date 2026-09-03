import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function DownloadButton({ onClick, isLoading, disabled }: DownloadButtonProps) {
  return (
    <Button
      variant="gradient"
      size="lg"
      onClick={onClick}
      disabled={isLoading || disabled}
      className="w-full h-14 rounded-2xl text-base font-bold tracking-wide shadow-xl shadow-blue-600/25"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin text-white" />
          <span>Creating Download Job...</span>
        </>
      ) : (
        <>
          <Download className="h-5 w-5 mr-2 text-white" />
          <span>DOWNLOAD NOW</span>
        </>
      )}
    </Button>
  );
}
