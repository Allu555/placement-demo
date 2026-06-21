'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, TrendingUp, Users, Award, ShieldCheck, DollarSign } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b'];

export default function AdminAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any>({
    totalStudents: 120,
    totalCompanies: 15,
    totalJobs: 8,
    totalApplications: 45,
    totalPlaced: 35,
    highestPackage: 24,
    averagePackage: 8.5,
  });

  const [branchData, setBranchData] = useState<any[]>([
    { name: 'Computer Science', placed: 85, total: 100, ratio: 85 },
    { name: 'Information Tech', placed: 72, total: 90, ratio: 80 },
    { name: 'Electronics & Comm', placed: 48, total: 80, ratio: 60 },
    { name: 'Electrical Eng', placed: 30, total: 60, ratio: 50 },
    { name: 'Mechanical Eng', placed: 20, total: 50, ratio: 40 },
  ]);

  const [trendData, setTrendData] = useState<any[]>([
    { name: 'Jan', placements: 4, avgPackage: 5.5 },
    { name: 'Feb', placements: 8, avgPackage: 6.2 },
    { name: 'Mar', placements: 15, avgPackage: 7.0 },
    { name: 'Apr', placements: 24, avgPackage: 7.8 },
    { name: 'May', placements: 30, avgPackage: 8.2 },
    { name: 'Jun', placements: 35, avgPackage: 8.5 },
  ]);

  const [pieData, setPieData] = useState<any[]>([
    { name: 'Offered', value: 35 },
    { name: 'Shortlisted', value: 15 },
    { name: 'Screening', value: 20 },
    { name: 'Rejected', value: 10 },
  ]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/tpo/stats');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.branchPlacements && data.branchPlacements.length > 0) {
          setBranchData(data.branchPlacements.map((b: any) => ({
            name: b.name,
            placed: b.placed,
            total: b.total,
            ratio: b.ratio
          })));
        }
        if (data.hiringTrends && data.hiringTrends.length > 0) {
          setTrendData(data.hiringTrends);
        }
      }
    } catch (e) {
      console.error('Failed loading analytics data:', e);
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">University Placement Analytics</h2>
        <p className="text-sm text-muted-foreground">Monitor branch placement ratios, average LPA compensation scales, and candidate statuses.</p>
      </div>

      {/* Stats summaries row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Average Salary</span>
            <div className="text-xl font-black mt-1 text-primary">{stats.averagePackage} LPA</div>
          </div>
          <TrendingUp className="h-8 w-8 text-primary opacity-20" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Highest Package</span>
            <div className="text-xl font-black mt-1 text-emerald-500">{stats.highestPackage} LPA</div>
          </div>
          <DollarSign className="h-8 w-8 text-emerald-500 opacity-20" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Placed</span>
            <div className="text-xl font-black mt-1">{stats.totalPlaced}</div>
          </div>
          <ShieldCheck className="h-8 w-8 text-blue-500 opacity-20" />
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Placement Ratio</span>
            <div className="text-xl font-black mt-1">
              {stats.totalStudents > 0 ? Math.round((stats.totalPlaced / stats.totalStudents) * 100) : 0}%
            </div>
          </div>
          <Users className="h-8 w-8 text-purple-500 opacity-20" />
        </Card>
      </div>

      {/* Graphs list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Placements by Branch Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-primary" />
              Branch Placement Ratios (%)
            </CardTitle>
            <CardDescription className="text-xs">Compares placed student ratios across branch disciplines</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar name="Placement Ratio (%)" dataKey="ratio" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Salary Packages Trends Line chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
              Compensation Packages Trends
            </CardTitle>
            <CardDescription className="text-xs">Tracks monthly average package salary rates (LPA)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line name="Avg Package (LPA)" type="monotone" dataKey="avgPackage" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Candidate Status pie distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Candidate Applications Distributions</CardTitle>
            <CardDescription className="text-xs">Aggregate statistics of active screening pipeline metrics</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-around h-60 gap-6">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend checklist */}
            <div className="space-y-2 text-xs w-full sm:w-1/2">
              {pieData.map((d, index) => (
                <div key={d.name} className="flex items-center justify-between border-b border-border/40 pb-1.5 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="font-semibold text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-black">{d.value} applications</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
