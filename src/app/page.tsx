'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/core/store';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, checkSession, isLoadingSession } = useAppStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isLoadingSession) {
      if (isAuthenticated && user) {
        if (user.role === 'STUDENT') {
          router.push('/student/profile');
        } else if (user.role === 'RECRUITER' || user.role === 'HR') {
          router.push('/recruiter/jobs');
        } else {
          router.push('/tpo/drives');
        }
      } else {
        router.push('/login');
      }
    }
  }, [isLoadingSession, isAuthenticated, user, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-slate-400">Loading placement platform...</p>
      </div>
    </div>
  );
}
