"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Shield, Users, Download, CheckCircle2, AlertCircle, HardDrive, Plus, Trash2, Globe } from 'lucide-react';

interface DomainItem {
  id: string;
  domain: string;
  enabled: boolean;
  notes?: string;
}

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [domains, setDomains] = useState<DomainItem[]>([
    { id: '1', domain: 'example.com', enabled: true, notes: 'Default HTML5 test domain' },
    { id: '2', domain: 'commondatastorage.googleapis.com', enabled: true, notes: 'Google Cloud sample video storage' },
    { id: '3', domain: 'sample-videos.com', enabled: true, notes: 'Public media stream test site' },
    { id: '4', domain: 'restricted-site.org', enabled: false, notes: 'Disabled domain' },
  ]);
  const [newDomain, setNewDomain] = useState('');
  const [search, setSearch] = useState('');

  const stats = {
    totalUsers: 48,
    totalDownloads: 1240,
    completed: 1150,
    failed: 90,
    activeJobs: 4,
    storageUsage: '14.2 GB',
  };

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    const cleanDomain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];

    const newItem: DomainItem = {
      id: `dom_${Date.now()}`,
      domain: cleanDomain,
      enabled: true,
      notes: 'Added via Admin Dashboard',
    };

    setDomains((prev) => [newItem, ...prev]);
    setNewDomain('');
    toast({
      title: 'Domain Added',
      description: `Domain ${cleanDomain} added to allowlist.`,
      variant: 'success',
    });
  };

  const toggleDomain = (id: string) => {
    setDomains((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
    toast({
      title: 'Domain Status Updated',
      description: 'Domain state toggled.',
      variant: 'default',
    });
  };

  const deleteDomain = (id: string) => {
    setDomains((prev) => prev.filter((d) => d.id !== id));
    toast({
      title: 'Domain Deleted',
      description: 'Domain removed from allowlist.',
      variant: 'destructive',
    });
  };

  const filteredDomains = domains.filter((d) =>
    d.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center space-x-3">
        <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
          <Shield className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin Control Center</h1>
          <p className="text-sm text-slate-400">System overview, metrics & domain allowlist management.</p>
        </div>
      </div>

      {/* Admin Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <Users className="h-5 w-5 mx-auto text-blue-400 mb-1" />
          <span className="text-[11px] uppercase font-semibold text-slate-400">Users</span>
          <div className="text-xl font-bold text-white mt-1">{stats.totalUsers}</div>
        </Card>

        <Card className="p-4 text-center">
          <Download className="h-5 w-5 mx-auto text-indigo-400 mb-1" />
          <span className="text-[11px] uppercase font-semibold text-slate-400">Downloads</span>
          <div className="text-xl font-bold text-white mt-1">{stats.totalDownloads}</div>
        </Card>

        <Card className="p-4 text-center">
          <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-400 mb-1" />
          <span className="text-[11px] uppercase font-semibold text-slate-400">Completed</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats.completed}</div>
        </Card>

        <Card className="p-4 text-center">
          <AlertCircle className="h-5 w-5 mx-auto text-red-400 mb-1" />
          <span className="text-[11px] uppercase font-semibold text-slate-400">Failed</span>
          <div className="text-xl font-bold text-red-400 mt-1">{stats.failed}</div>
        </Card>

        <Card className="p-4 text-center">
          <Globe className="h-5 w-5 mx-auto text-amber-400 mb-1" />
          <span className="text-[11px] uppercase font-semibold text-slate-400">Active Jobs</span>
          <div className="text-xl font-bold text-amber-400 mt-1">{stats.activeJobs}</div>
        </Card>

        <Card className="p-4 text-center">
          <HardDrive className="h-5 w-5 mx-auto text-purple-400 mb-1" />
          <span className="text-[11px] uppercase font-semibold text-slate-400">Storage</span>
          <div className="text-xl font-bold text-purple-400 mt-1">{stats.storageUsage}</div>
        </Card>
      </div>

      {/* Domain Management */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <CardTitle className="text-xl">Supported Domain Allowlist</CardTitle>
            <p className="text-xs text-slate-400">Manage allowed source media domains.</p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Add new domain (e.g. video-site.com)..."
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="h-10 text-xs w-full sm:w-64 bg-card/60"
            />
            <Button variant="gradient" size="sm" onClick={handleAddDomain} className="shrink-0">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Filter domain list..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 text-xs max-w-xs bg-card/40"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDomains.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-semibold text-white">
                    {item.domain}
                  </TableCell>
                  <TableCell>
                    {item.enabled ? (
                      <Badge variant="success">ENABLED</Badge>
                    ) : (
                      <Badge variant="destructive">DISABLED</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">{item.notes || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDomain(item.id)}
                        className="text-xs h-8 border-slate-700"
                      >
                        {item.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDomain(item.id)}
                        className="text-slate-400 hover:text-red-400 h-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
