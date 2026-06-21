'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/core/store';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Award, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkSession, setUser } = useAppStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectUser = (role: string) => {
    if (role === 'STUDENT') {
      router.push('/student/profile');
    } else if (role === 'RECRUITER' || role === 'HR') {
      router.push('/recruiter/jobs');
    } else {
      router.push('/tpo/drives');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setSuccess('Logged in successfully. Redirecting...');
      setUser(data.user);
      setTimeout(() => {
        redirectUser(data.user.role);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Server error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 premium-gradient">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Award className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Campus Placement Platform</h2>
          <p className="text-sm text-slate-400">Enterprise Career Management System</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white text-xl">Sign In</CardTitle>
            <CardDescription className="text-slate-400">Enter your credentials to access the placement ecosystem</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0 animate-bounce" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <Input
                  type="email"
                  placeholder="name@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-2">
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-medium" disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
              <div className="text-xs text-center text-slate-400">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary hover:underline font-semibold">
                  Register here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
