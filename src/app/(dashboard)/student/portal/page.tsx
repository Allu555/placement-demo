'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, CheckCircle, ShieldAlert, BadgeInfo, Calendar, 
  MapPin, DollarSign, Search, Award
} from 'lucide-react';

export default function StudentPortalPage() {
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter states
  const [search, setSearch] = useState('');
  const [minLpa, setMinLpa] = useState('');
  
  // Application submission progress indicators
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Student profile to calculate eligibility criteria
      const profileRes = await fetch('/api/student/profile');
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // 2. Fetch Active Jobs
      const jobsRes = await fetch('/api/jobs');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }

      // 3. Fetch current application IDs to block duplicate applies
      const appsRes = await fetch('/api/student/applications');
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        const activeIds = appsData.map((app: any) => app.jobId);
        setAppliedJobIds(activeIds);
      }
    } catch (e) {
      console.error('Failed loading portal details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    setFeedbackMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setFeedbackMsg({ type: 'success', text: 'Application submitted successfully!' });
      setAppliedJobIds((prev) => [...prev, jobId]);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Server error.' });
    } finally {
      setApplyingId(null);
    }
  };

  // Run eligibility checks locally to render UI tags
  const runEligibilityCheck = (job: any) => {
    if (!profile) return { eligible: true, reasons: [] };
    
    const reasons: string[] = [];
    if (profile.cgpa < job.eligibilityCgpa) {
      reasons.push(`CGPA (${profile.cgpa}) is below required ${job.eligibilityCgpa}`);
    }
    if (profile.backlogs > job.eligibilityBacklogs) {
      reasons.push(`Backlogs (${profile.backlogs}) exceed max allowed ${job.eligibilityBacklogs}`);
    }
    if (job.eligibilityBranches && job.eligibilityBranches.length > 0) {
      const isBranchEligible = job.eligibilityBranches.includes(profile.branch?.code || 'CSE_BTECH');
      if (!isBranchEligible) {
        reasons.push(`Branch is not in target list (${job.eligibilityBranches.join(', ')})`);
      }
    }
    if (new Date() > new Date(job.deadline)) {
      reasons.push('Deadline has passed');
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  };

  // Filter Jobs list
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.company.name.toLowerCase().includes(search.toLowerCase());
    const matchesLpa = minLpa ? job.salaryPackage >= parseFloat(minLpa) : true;
    return matchesSearch && matchesLpa;
  });

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Active Placement Drives</h2>
          <p className="text-sm text-muted-foreground">Browse corporate openings and check real-time application eligibility.</p>
        </div>
      </div>

      {/* Global alert feedback overlay */}
      {feedbackMsg.text && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 animate-in fade-in duration-300 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filters Search Board */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search by job title or company name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full md:w-48">
          <Input 
            type="number" 
            placeholder="Min package (LPA)" 
            value={minLpa}
            onChange={(e) => setMinLpa(e.target.value)}
          />
        </div>
      </div>

      {/* Drives Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No active placement drives found matching filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => {
            const check = runEligibilityCheck(job);
            const hasApplied = appliedJobIds.includes(job.id);
            
            return (
              <Card key={job.id} className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{job.title}</CardTitle>
                      <CardDescription className="text-xs font-semibold text-primary">{job.company?.name}</CardDescription>
                    </div>
                    {/* Package Badge */}
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-bold border border-primary/10 shrink-0">
                      <DollarSign className="h-3 w-3" />
                      <span>{job.salaryPackage} LPA</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Job details tags */}
                  <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Requirements section */}
                  <div className="text-xs">
                    <span className="font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Requirements</span>
                    <p className="text-muted-foreground mt-0.5">{job.requirements}</p>
                  </div>

                  {/* Eligibility display */}
                  <div className="pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Eligibility Criteria</span>
                      {check.eligible ? (
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Eligible</span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-500 uppercase">Not Eligible</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/20">
                      <div>Min CGPA: <strong className="text-foreground">{job.eligibilityCgpa}</strong></div>
                      <div>Max Backlogs: <strong className="text-foreground">{job.eligibilityBacklogs}</strong></div>
                    </div>

                    {!check.eligible && (
                      <div className="mt-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10 text-[10px] text-red-500 flex items-start gap-2">
                        <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          {check.reasons.map((r, i) => <div key={i}>{r}</div>)}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-4 border-t border-border/40 bg-muted/5 rounded-b-xl">
                  {hasApplied ? (
                    <Button disabled className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">
                      <CheckCircle className="h-4 w-4" />
                      Applied
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleApply(job.id)}
                      disabled={!check.eligible || applyingId === job.id}
                      className="w-full cursor-pointer text-xs h-9"
                    >
                      {applyingId === job.id ? 'Applying...' : 'Apply Now'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
