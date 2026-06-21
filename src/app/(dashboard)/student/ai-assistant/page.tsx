'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Bot, Sparkles, Send, Map, MessageSquare, Terminal, 
  HelpCircle, ChevronRight, Award
} from 'lucide-react';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'roadmap'>('chat');

  // Chatbot states
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! I am your AI Placement Assistant. Ask me questions like "Am I eligible?", "Improve my resume", "Mock interview", or "Generate cover letter"!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Roadmap states
  const [topic, setTopic] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      // In this setup, we can use the local fallback / prompt execution service directly via a client endpoint or mock.
      // Let's call the generic prompt check or mock endpoint to simulate Gemini.
      const res = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Reuse the roadmap endpoint as a generic assistant handler since it runs executePrompt internally!
        body: JSON.stringify({ topic: userText }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect');

      setMessages((prev) => [...prev, { sender: 'ai', text: data.roadmap || data.error }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { sender: 'ai', text: `Sorry, I encountered an issue: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setRoadmapLoading(true);
    setRoadmap('');
    try {
      const res = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      setRoadmap(data.roadmap);
    } catch (err: any) {
      setRoadmap(`Error generating roadmap: ${err.message}`);
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">AI Placement Assistant</h2>
        <p className="text-sm text-muted-foreground">Your personalized co-pilot for resume reviews, mock questions, and learning schedules.</p>
      </div>

      {/* Tabs selectors */}
      <div className="flex gap-2 border-b border-border pb-px">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-all duration-200 ${
            activeTab === 'chat' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Mock Interview & Chat
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-all duration-200 ${
            activeTab === 'roadmap' 
              ? 'border-primary text-primary font-bold' 
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Map className="h-4 w-4" />
          Custom Learning Roadmaps
        </button>
      </div>

      {/* Chat View Tab */}
      {activeTab === 'chat' && (
        <Card className="flex flex-col h-[500px]">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="h-4.5 w-4.5 text-primary" />
              Interview Advisor AI
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Online</CardDescription>
          </CardHeader>
          
          {/* Chat dialog messages list */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground border border-border/40 whitespace-pre-wrap'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground rounded-xl px-4 py-2.5 text-xs flex items-center gap-2 border border-border/40">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 delay-100" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 delay-200" />
                </div>
              </div>
            )}
          </CardContent>

          {/* Form Chat Input */}
          <div className="p-4 border-t border-border/40 bg-muted/5">
            <form onSubmit={handleSendChat} className="flex gap-2">
              <Input 
                type="text" 
                placeholder="Ask me to start a mock interview, review keywords, or summarize resume suggestions..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                className="bg-card/50"
              />
              <Button type="submit" size="icon" disabled={chatLoading} className="cursor-pointer">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      {/* Roadmap View Tab */}
      {activeTab === 'roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generate Roadmap</CardTitle>
                <CardDescription>Enter a domain topic to get a custom learning schedule.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateRoadmap} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Domain Topic</label>
                    <Input 
                      type="text" 
                      placeholder="e.g. Next.js, System Design, SQL sheets"
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={roadmapLoading} className="w-full cursor-pointer text-xs flex gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    {roadmapLoading ? 'Compiling roadmap...' : 'Build Roadmap'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Output Card */}
          <div className="lg:col-span-2">
            <Card className="min-h-[300px] flex flex-col">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm">Structured Guide</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                {roadmapLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-xs text-muted-foreground">Analyzing learning resources...</span>
                  </div>
                ) : roadmap ? (
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {roadmap}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full py-12">
                    <Map className="h-8 w-8 text-muted-foreground opacity-30 mb-2" />
                    <p className="text-xs text-muted-foreground">Submit a topic to generate your customized step-by-step career path.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}
