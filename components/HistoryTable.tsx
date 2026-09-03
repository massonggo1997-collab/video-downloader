"use client"

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, Download, ExternalLink, Calendar, Film } from 'lucide-react';
import { DownloadJob } from '@/types/download';

interface HistoryTableProps {
  downloads: DownloadJob[];
  onDelete?: (id: string) => void;
  onFilterChange?: (search: string, status: string) => void;
}

export function HistoryTable({ downloads, onDelete, onFilterChange }: HistoryTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (onFilterChange) onFilterChange(val, statusFilter);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatusFilter(val);
    if (onFilterChange) onFilterChange(search, val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'PROCESSING':
        return <Badge variant="info">Processing</Badge>;
      case 'QUEUED':
        return <Badge variant="warning">Queued</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by video title..."
            value={search}
            onChange={handleSearchChange}
            className="pl-10 h-11 bg-card/60 border-white/10"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="h-11 px-4 rounded-xl border border-white/10 bg-card/80 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {downloads.length === 0 ? (
        <div className="p-12 text-center border border-white/10 rounded-2xl bg-card/30 text-slate-400">
          <Film className="h-10 w-10 mx-auto mb-2 text-slate-600" />
          <p>No download records found matching your filters.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Video Title</TableHead>
              <TableHead>Quality / Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {downloads.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-white max-w-xs truncate">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200 line-clamp-1">{item.title}</span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline flex items-center space-x-1 mt-0.5"
                    >
                      <span className="truncate max-w-[200px]">{item.sourceDomain || item.sourceUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                      {item.quality}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {item.format}
                    </span>
                  </div>
                </TableCell>

                <TableCell>{getStatusBadge(item.status)}</TableCell>

                <TableCell className="text-xs text-slate-400 font-mono">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {item.status === 'COMPLETED' && item.fileUrl && (
                      <a href={item.fileUrl} download target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="text-emerald-400 hover:bg-emerald-500/10">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(item.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
