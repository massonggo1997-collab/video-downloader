import React from 'react';
import { Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyzeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function AnalyzeButton({ onClick, isLoading, disabled }: AnalyzeButtonProps) {
  return (
    <Button
      type="submit"
      variant="gradient"
      size="lg"
      onClick={onClick}
      disabled={isLoading || disabled}
      className="w-full sm:w-auto min-w-[180px] h-13 rounded-xl shadow-lg font-semibold tracking-wide cursor-pointer"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin text-white" />
          <span>Analyzing...</span>
        </>
      ) : (
        <>
          <Search className="h-5 w-5 mr-2 text-white" />
          <span>ANALYZE</span>
        </>
      )}
    </Button>
  );
}
