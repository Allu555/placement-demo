'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  User, BookOpen, Briefcase, Code, Award, CheckCircle, 
  Globe, Link as LinkIcon, ShieldAlert, Cpu, Sparkles, Plus, Trash2
} from 'lucide-react';

interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  cgpa: number;
}

interface ProjectItem {
  id?: string;
  title: string;
  description: string;
  url?: string;
  githubUrl?: string;
}

interface ExperienceItem {
  id?: string;
  companyName: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [cgpa, setCgpa] = useState(8.5);
  const [semester, setSemester] = useState(6);
  const [backlogs, setBacklogs] = useState(0);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  
  // Skills lists
  const [skillsStr, setSkillsStr] = useState('');

  // ATS Helper details
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/student/profile');
      if (!res.ok) throw new Error('Failed to load profile.');
      const data = await res.json();
      setProfile(data);
      
      // Populate fields
      setBio(data.bio || '');
      setPhone(data.phone || '');
      setCgpa(data.cgpa || 8.0);
      setSemester(data.semester || 6);
      setBacklogs(data.backlogs || 0);
      setGithubUrl(data.githubUrl || '');
      setLinkedinUrl(data.linkedinUrl || '');
      setPortfolioUrl(data.portfolioUrl || '');
      setLeetcodeUrl(data.leetcodeUrl || '');
      
      const currentSkills = data.skills?.map((s: any) => s.skill.name).join(', ') || '';
      setSkillsStr(currentSkills);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(Boolean);

      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          phone,
          cgpa,
          semester,
          backlogs,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
          leetcodeUrl,
          skills: skillsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setSuccess('Profile updated successfully.');
      setProfile(data.profile);
    } catch (err: any) {
      setError(err.message || 'Server error.');
    } finally {
      setSaving(false);
    }
  };

  const runAtsCheck = async () => {
    setAtsLoading(true);
    setAtsResult(null);
    try {
      const res = await fetch('/api/ai/resume-check', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ATS scan failed');
      setAtsResult(data);
      // Refresh score in header
      setProfile((prev: any) => ({ ...prev, resumeAtsScore: data.score }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAtsLoading(false);
    }
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
      {/* Profile Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-card/30 backdrop-blur-md p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 flex-col md:flex-row text-center md:text-left">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-2xl border border-primary/20">
            {profile?.user?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{profile?.user?.name}</h2>
            <p className="text-sm text-muted-foreground">{profile?.branch?.name} ({profile?.branch?.code})</p>
            <p className="text-xs text-muted-foreground mt-1">Roll No: {profile?.rollNumber}</p>
          </div>
        </div>

        {/* Completion Ring & ATS Score */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-black text-primary">{profile?.completionPercentage}%</div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Completeness</span>
          </div>

          <div className="h-px w-8 bg-border hidden sm:block" />

          <div className="text-center">
            <div className="text-2xl font-black text-amber-500">{profile?.resumeAtsScore || 'N/A'}</div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">ATS CV Score</span>
          </div>

          <Button 
            onClick={runAtsCheck} 
            disabled={atsLoading}
            variant="outline" 
            className="border-primary/30 hover:bg-primary/5 text-primary text-xs flex gap-2 cursor-pointer h-9"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {atsLoading ? 'Scanning...' : 'AI ATS Review'}
          </Button>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Profile Edit Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Keep your academic records and contact details accurate</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {error && <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</div>}
                {success && <div className="text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">{success}</div>}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">CGPA</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      max="10" 
                      required 
                      value={cgpa} 
                      onChange={(e) => setCgpa(parseFloat(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Semester</label>
                    <Input 
                      type="number" 
                      required 
                      value={semester} 
                      onChange={(e) => setSemester(parseInt(e.target.value))} 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Active Backlogs</label>
                    <Input 
                      type="number" 
                      required 
                      value={backlogs} 
                      onChange={(e) => setBacklogs(parseInt(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Bio / Objective</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-primary/50"
                    placeholder="Describe your career goals, technical background, and specialities..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234-567-890" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">LeetCode URL</label>
                    <Input type="url" value={leetcodeUrl} onChange={(e) => setLeetcodeUrl(e.target.value)} placeholder="https://leetcode.com/username" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
                    <Input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">GitHub URL</label>
                    <Input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Portfolio Website</label>
                    <Input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://my-portfolio.com" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Skills (comma separated)</label>
                  <Input 
                    type="text" 
                    value={skillsStr} 
                    onChange={(e) => setSkillsStr(e.target.value)} 
                    placeholder="React, TypeScript, Next.js, Node.js, PostgreSQL, Docker, Git" 
                  />
                </div>

                <Button type="submit" disabled={saving} className="cursor-pointer">
                  {saving ? 'Saving changes...' : 'Save Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets - ATS Report details */}
        <div className="space-y-6">
          {/* AI ATS Check visual report */}
          {atsResult && (
            <Card className="border-amber-500/20 bg-amber-500/5 animate-in fade-in duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-2 text-md">
                  <Cpu className="h-4 w-4" />
                  AI ATS Audit results
                </CardTitle>
                <CardDescription className="text-xs text-amber-700/80 dark:text-amber-500/80">
                  Scanned score: <strong className="text-sm font-black text-amber-500">{atsResult.score}/100</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Suggestions list */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Improvement Checklist</span>
                  <ul className="text-xs space-y-1.5 list-disc pl-4 text-muted-foreground leading-relaxed">
                    {atsResult.suggestions.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Keywords checklist */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Missing Industry Keywords</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {atsResult.missingKeywords.slice(0, 5).map((kw: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] border border-red-500/10">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Matched Keywords</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {atsResult.matchedKeywords.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground">None detected. Add tech keywords above.</span>
                    ) : (
                      atsResult.matchedKeywords.map((kw: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] border border-emerald-500/10">
                          {kw}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Presence overview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-md">Social Profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Globe className="h-4 w-4 text-indigo-500" />
                {linkedinUrl ? (
                  <a href={linkedinUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                    {linkedinUrl.replace('https://', '')}
                  </a>
                ) : (
                  <span>No LinkedIn profile linked</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <LinkIcon className="h-4 w-4 text-slate-800 dark:text-slate-100" />
                {githubUrl ? (
                  <a href={githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                    {githubUrl.replace('https://', '')}
                  </a>
                ) : (
                  <span>No GitHub profile linked</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
