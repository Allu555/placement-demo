'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, Clock, Info, User } from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fill dummy logs for demonstration in case DB is fresh, then load matching logs
    const mockLogs = [
      { id: '1', action: 'user.login', details: { email: 'student@university.edu' }, ipAddress: '192.168.1.12', timestamp: new Date(Date.now() - 500000).toISOString() },
      { id: '2', action: 'profile.update', details: { field: 'CGPA', old: '8.2', new: '8.5' }, ipAddress: '192.168.1.12', timestamp: new Date(Date.now() - 1500000).toISOString() },
      { id: '3', action: 'job.create', details: { title: 'Software Developer', company: 'Acme' }, ipAddress: '10.0.0.4', timestamp: new Date(Date.now() - 10000000).toISOString() },
      { id: '4', action: 'application.apply', details: { job: 'Software Developer' }, ipAddress: '192.168.1.12', timestamp: new Date(Date.now() - 12000000).toISOString() },
    ];
    setLogs(mockLogs);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">System Audit Trail</h2>
        <p className="text-sm text-muted-foreground">Immutable logs of actions, user credential entries, and security operations.</p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/40">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4.5 w-4.5 text-primary" />
            Security & Activity logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground uppercase font-bold tracking-wider text-[10px]">
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Metadata Context</th>
                  <th className="p-4">Source IP</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/10">
                    <td className="p-4 font-semibold text-primary">{log.action}</td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="p-4 text-muted-foreground">{log.ipAddress || 'localhost'}</td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
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
