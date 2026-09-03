"use client"

import React, { useState } from 'react';
import { Link2, Clipboard, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UrlInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function UrlInput({ value, onChange, onSubmit, isLoading }: UrlInputProps) {
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text.trim());
        setErrorHint(null);
      }
    } catch {
      // Clipboard access denied
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
      setErrorHint('URL must begin with http:// or https://');
    } else {
      setErrorHint(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-2">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 pointer-events-none">
          <Link2 className="h-5 w-5" />
        </div>

        <Input
          type="url"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Paste video URL (e.g. https://example.com/video.mp4)..."
          disabled={isLoading}
          aria-label="Paste video URL"
          className="pl-12 pr-24 h-14 text-base rounded-2xl bg-card/80 border-white/10 shadow-2xl focus-visible:ring-blue-500"
        />

        <div className="absolute right-3 flex items-center space-x-1">
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setErrorHint(null);
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePaste}
              className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 px-2.5 h-8 rounded-lg"
            >
              <Clipboard className="h-3.5 w-3.5 mr-1" />
              Paste
            </Button>
          )}
        </div>
      </div>

      {errorHint && (
        <p className="text-xs text-amber-400 pl-4 font-medium">{errorHint}</p>
      )}
    </div>
  );
}
