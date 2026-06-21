'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  FileText, Clock, HelpCircle, UserCheck, CheckCircle2, 
  XCircle, Award, Calendar, ExternalLink
} from 'lucide-react';

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/student/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error('Failed loading applications list:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'OFFERED':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'REJECTED':
        return 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400';
      case 'APPLIED':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'WITHDRAWN':
        return 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400';
      default:
        return 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400';
    }
  };

  const getTimelineSteps = (status: string) => {
    // Standard sequence: Applied -> Screening -> Shortlisted/Technical -> HR -> Offered/Rejected
    const steps = [
      { label: 'Applied', reached: true },
      { label: 'Screening', reached: ['SCREENING', 'SHORTLISTED', 'TECHNICAL_ROUND', 'HR_ROUND', 'OFFERED', 'REJECTED'].includes(status) },
      { label: 'Technical Round', reached: ['TECHNICAL_ROUND', 'HR_ROUND', 'OFFERED', 'REJECTED'].includes(status) },
      { label: 'HR Interview', reached: ['HR_ROUND', 'OFFERED', 'REJECTED'].includes(status) },
      { label: 'Offer Status', reached: ['OFFERED', 'REJECTED'].includes(status), terminal: true, error: status === 'REJECTED' },
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Application Tracker</h2>
        <p className="text-sm text-muted-foreground">Monitor the interview status and feedback logs of your applied positions.</p>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">You have not submitted any applications yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const steps = getTimelineSteps(app.status);
            return (
              <Card key={app.id}>
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{app.job?.title}</CardTitle>
                      <CardDescription className="text-xs font-semibold text-primary">{app.job?.company?.name}</CardDescription>
                    </div>
                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-center capitalize ${getStatusStyle(app.status)}`}>
                      {app.status.toLowerCase().replace('_', ' ')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                  {/* Timeline progress indicator */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recruitment Progress</span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-start gap-1 relative">
                          <div className="flex items-center gap-2">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center border shrink-0 text-[10px] ${
                              step.reached
                                ? step.error 
                                  ? 'bg-red-500 border-red-500 text-white' 
                                  : 'bg-primary border-primary text-white'
                                : 'bg-transparent border-muted text-muted-foreground'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className={`text-[11px] font-medium leading-none ${step.reached ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                              {step.label}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interiew schedules details */}
                  {app.interviews && app.interviews.length > 0 && (
                    <div className="p-3.5 rounded-lg bg-indigo-500/5 border border-indigo-500/10 space-y-2 text-xs">
                      <span className="font-bold text-indigo-500 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <Calendar className="h-4 w-4" />
                        Upcoming Interview Rounds
                      </span>
                      {app.interviews.map((intr: any, i: number) => (
                        <div key={intr.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-500/10 pb-2 last:border-0 last:pb-0 gap-1.5">
                          <div>
                            <p className="font-semibold text-foreground">Round {intr.roundIndex}: {intr.roundName}</p>
                            <p className="text-[10px] text-muted-foreground">Scheduled for {new Date(intr.scheduledAt).toLocaleString()}</p>
                          </div>
                          {intr.joinUrl && (
                            <a 
                              href={intr.joinUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[10px] text-indigo-500 font-semibold hover:underline flex items-center gap-1 self-start sm:self-center"
                            >
                              Join Meeting
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Feedback display */}
                  {app.feedback && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Recruiter Feedback Remarks</span>
                      <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/40 leading-relaxed italic">
                        "{app.feedback}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
