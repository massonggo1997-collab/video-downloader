"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { User, Save } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email || '');
        setUsername(data.user.user_metadata?.username || data.user.email?.split('@')[0] || '');
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { username },
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile settings.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Settings Saved',
        description: 'Your profile settings have been updated.',
        variant: 'success',
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Account Settings</h1>
        <p className="text-sm text-slate-400">Manage your user profile details.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address (Read only)</label>
              <Input
                type="email"
                value={email}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
            </div>

            <CardFooter className="p-0 pt-4">
              <Button type="submit" variant="gradient" className="h-11">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
