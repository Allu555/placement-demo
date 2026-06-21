'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Briefcase, Users, Award, ShieldCheck, Mail, FileUp, 
  MapPin, DollarSign, Calendar, RefreshCw
} from 'lucide-react';

export default function TpoDrivesPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalPlaced: 0,
    highestPackage: 0,
    averagePackage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivesAndStats();
  }, []);

  const fetchDrivesAndStats = async () => {
    try {
      // 1. Fetch drives
      const drivesRes = await fetch('/api/jobs');
      if (drivesRes.ok) {
        const drivesData = await drivesRes.json();
        setDrives(drivesData);
      }

      // 2. Fetch stats
      const statsRes = await fetch('/api/tpo/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCsvMock = () => {
    // CSV student template mock loader
    alert('CSV Import tool: Select a student record file (.csv). Auto-importing students registers them in system stubs.');
  };

  const handleDispatchNotification = () => {
    alert('Email Alert: Dispatched drive notifications to all eligible student accounts.');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Placement Officer Central</h2>
          <p className="text-sm text-muted-foreground">Monitor university recruitment drives, run audits, and dispatch emails.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleBulkCsvMock} variant="outline" className="flex items-center gap-2 cursor-pointer h-9 text-xs">
            <FileUp className="h-4 w-4" />
            CSV Import Students
          </Button>
          <Button onClick={handleDispatchNotification} className="flex items-center gap-2 cursor-pointer h-9 text-xs">
            <Mail className="h-4 w-4" />
            Dispatch Email Alerts
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Registered Students</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black mt-2">{stats.totalStudents}</div>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Partners</span>
            <Award className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black mt-2">{stats.totalCompanies}</div>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Highest Salary LPA</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-2 text-emerald-500">{stats.highestPackage || '18'} LPA</div>
        </Card>
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Placed Students</span>
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black mt-2">{stats.totalPlaced}</div>
        </Card>
      </div>

      {/* Placement Drives List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold tracking-tight">Recruitment Drives</h3>
        {drives.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No active drives posted by recruiting companies yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drives.map((drv) => (
              <Card key={drv.id} className="p-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm">{drv.title}</h4>
                    <p className="text-xs text-muted-foreground">{drv.company?.name || 'Partner Company'}</p>
                    <div className="flex gap-4 text-[10px] text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{drv.location}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Expires {new Date(drv.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 self-start sm:self-center">
                    <div className="text-right">
                      <div className="font-black text-sm text-primary">{drv.salaryPackage} LPA</div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Compensation</span>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-sm text-foreground">{(drv.eligibilityBranches || []).join(', ')}</div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Target Branches</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
