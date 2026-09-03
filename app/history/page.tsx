"use client"

import React, { useEffect, useState } from 'react';
import { HistoryTable } from '@/components/HistoryTable';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DownloadJob } from '@/types/download';

export default function HistoryPage() {
  const { toast } = useToast();
  const [downloads, setDownloads] = useState<DownloadJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/history?search=${encodeURIComponent(search)}&status=${statusFilter}&page=${page}&limit=10`);
      const json = await res.json();
      if (json.success && json.data) {
        setDownloads(json.data.downloads || []);
        setTotalPages(json.data.totalPages || 1);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load download history.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast({
          title: 'Item Deleted',
          description: 'Download history record removed.',
          variant: 'success',
        });
        setDownloads((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete history record.',
        variant: 'destructive',
      });
    }
  };

  const handleFilterChange = (newSearch: string, newStatus: string) => {
    setSearch(newSearch);
    setStatusFilter(newStatus);
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Download History</h1>
        <p className="text-sm text-slate-400">Search, filter, and manage your past video download requests.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : downloads.length === 0 && !search && statusFilter === 'ALL' ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          <HistoryTable
            downloads={downloads}
            onDelete={handleDelete}
            onFilterChange={handleFilterChange}
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-800 text-slate-300"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-slate-800 text-slate-300"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
