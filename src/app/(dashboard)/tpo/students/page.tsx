'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, Filter, Cpu, CheckCircle } from 'lucide-react';

export default function TpoStudentsPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    // Fill dummy candidates for display, then run matching loads
    const mockStudents = [
      { id: '1', user: { name: 'Alice Smith', email: 'alice@stu.edu' }, rollNumber: 'STU_1001', cgpa: 9.2, branch: { name: 'Computer Science', code: 'CSE_BTECH' }, backlogs: 0, completionPercentage: 90 },
      { id: '2', user: { name: 'Bob Johnson', email: 'bob@stu.edu' }, rollNumber: 'STU_1002', cgpa: 7.8, branch: { name: 'Computer Science', code: 'CSE_BTECH' }, backlogs: 0, completionPercentage: 85 },
      { id: '3', user: { name: 'Charlie Lee', email: 'charlie@stu.edu' }, rollNumber: 'STU_1003', cgpa: 8.5, branch: { name: 'Information Tech', code: 'IT_BTECH' }, backlogs: 1, completionPercentage: 70 },
      { id: '4', user: { name: 'Diana Prince', email: 'diana@stu.edu' }, rollNumber: 'STU_1004', cgpa: 6.9, branch: { name: 'Electronics & Comm', code: 'ECE_BTECH' }, backlogs: 0, completionPercentage: 95 },
    ];
    setProfiles(mockStudents);
    setLoading(false);
  }, []);

  const filtered = profiles.filter((p) => {
    const matchesSearch = p.user.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchesCgpa = minCgpa ? p.cgpa >= parseFloat(minCgpa) : true;
    const matchesBranch = selectedBranch ? p.branch.code === selectedBranch : true;
    return matchesSearch && matchesCgpa && matchesBranch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Student Directory</h2>
        <p className="text-sm text-muted-foreground">Search and audit all student profiles registered on the platform.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Search by candidate name or roll number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="w-full md:w-36">
          <Input 
            type="number" 
            placeholder="Min CGPA" 
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
            className="text-xs"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">All Branches</option>
            <option value="CSE_BTECH">Computer Science (CSE)</option>
            <option value="IT_BTECH">Information Tech (IT)</option>
            <option value="ECE_BTECH">Electronics & Comm (ECE)</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                  <th className="p-4">Student</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Branch Code</th>
                  <th className="p-4">CGPA</th>
                  <th className="p-4">Active Backlogs</th>
                  <th className="p-4">Profile Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/10">
                    <td className="p-4 flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px] border border-primary/20">
                        {p.user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{p.user.name}</div>
                        <div className="text-[10px] text-muted-foreground">{p.user.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{p.rollNumber}</td>
                    <td className="p-4 text-muted-foreground">{p.branch.code}</td>
                    <td className="p-4 font-semibold text-foreground">{p.cgpa}</td>
                    <td className="p-4">
                      {p.backlogs > 0 ? (
                        <span className="text-red-500 font-semibold">{p.backlogs} backlogs</span>
                      ) : (
                        <span className="text-emerald-500 font-semibold">0</span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-foreground">{p.completionPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
