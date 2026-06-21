import { prisma } from '@/core/database/prisma';

export interface ResumeAtsResult {
  score: number;
  suggestions: string[];
  missingKeywords: string[];
  matchedKeywords: string[];
}

export class AiService {
  /**
   * Helper to execute prompts using Gemini API.
   * If GEMINI_API_KEY is not defined, it resolves using local heuristic analyzer.
   */
  async executePrompt(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Mock Fallback
      return this.localFallbackMock(systemPrompt, userPrompt);
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${systemPrompt}\n\nUser Query:\n${userPrompt}` }
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      const json = await response.json();
      if (json?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return json.candidates[0].content.parts[0].text;
      }
      throw new Error(json?.error?.message || 'Empty response from Gemini API.');
    } catch (e: any) {
      console.error('Gemini API call failed, falling back:', e);
      return this.localFallbackMock(systemPrompt, userPrompt) + `\n\n*(Note: Fallback mode active. Gemini API error: ${e.message})*`;
    }
  }

  async checkEligibility(studentProfileId: string, jobId: string): Promise<string> {
    const profile = await prisma.profile.findUnique({
      where: { id: studentProfileId },
      include: { branch: true },
    });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!profile || !job) {
      return 'Student profile or job opening details not found.';
    }

    const system = 'You are a career placement officer. Validate eligibility criteria.';
    const user = `Student Profile:\n- CGPA: ${profile.cgpa}\n- Active Backlogs: ${profile.backlogs}\n- Branch: ${profile.branch.name} (${profile.branch.code})\n\nJob Details:\n- Title: ${job.title} at ${job.company.name}\n- Minimum CGPA Required: ${job.eligibilityCgpa}\n- Maximum Backlogs Allowed: ${job.eligibilityBacklogs}\n- Target Branches: ${job.eligibilityBranches.join(', ')}`;

    return this.executePrompt(system, user);
  }

  async optimizeResume(profileId: string): Promise<ResumeAtsResult> {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { education: true, experience: true, projects: true, skills: { include: { skill: true } } },
    });

    if (!profile) {
      throw new Error('Profile not found.');
    }

    // Heuristics keywords for standard tech placements
    const standardKeywords = ['react', 'next.js', 'typescript', 'postgresql', 'prisma', 'node.js', 'docker', 'redis', 'git', 'jest', 'algorithms', 'database', 'rest api', 'aws'];
    const studentSkills = profile.skills.map((s) => s.skill.name.toLowerCase());
    const matched = standardKeywords.filter((kw) => studentSkills.includes(kw));
    const missing = standardKeywords.filter((kw) => !studentSkills.includes(kw));

    // Calculate score
    let score = 30; // base score
    if (profile.education.length > 0) score += 15;
    if (profile.experience.length > 0) score += 20;
    if (profile.projects.length > 0) score += 15;
    score += matched.length * 2.5;
    score = Math.min(score, 100);

    const suggestions: string[] = [];
    if (profile.cgpa < 7.5) {
      suggestions.push('Maintain academic performance above 7.5 CGPA to bypass automatic recruiter screening.');
    }
    if (profile.experience.length === 0) {
      suggestions.push('Add an internship or freelance experience block. Relevant real-world work carries high hiring weight.');
    }
    if (profile.projects.length < 2) {
      suggestions.push('Include at least 2 full-stack projects featuring clean architectures, database integrations, and live links.');
    }
    if (missing.length > 0) {
      suggestions.push(`Consider acquiring and listing core industry skills: ${missing.slice(0, 4).join(', ')}.`);
    }

    // Save ATS score back to database
    await prisma.profile.update({
      where: { id: profileId },
      data: { resumeAtsScore: Math.round(score) },
    });

    return {
      score: Math.round(score),
      suggestions,
      missingKeywords: missing,
      matchedKeywords: matched,
    };
  }

  async generateCoverLetter(profileId: string, jobDetails: string): Promise<string> {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { skills: { include: { skill: true } } },
    });

    const studentSkills = profile?.skills.map((s) => s.skill.name).join(', ') || 'software development';
    const system = 'You are a professional cover letter designer. Draft a custom cover letter.';
    const user = `Candidate Skills: ${studentSkills}\nCandidate Bio: ${profile?.bio || ''}\n\nJob details:\n${jobDetails}`;

    return this.executePrompt(system, user);
  }

  async getCareerRoadmap(topic: string): Promise<string> {
    const system = 'You are an elite career advisor. Outline a step-by-step roadmap with topics, projects, resources, and timelines.';
    const user = `Topic: ${topic}`;
    return this.executePrompt(system, user);
  }

  private localFallbackMock(systemPrompt: string, userPrompt: string): string {
    // Basic heuristics to make fallbacks look clean and helpful
    if (systemPrompt.includes('cover letter')) {
      return `Dear Hiring Manager,

I am writing to express my strong interest in the open position. Having reviewed the job description, I am confident that my technical skills match your requirements.

Throughout my academic tenure, I have focused heavily on building robust and scalable applications. My skill set includes frontend interfaces, database schemas, and RESTful routing, which directly align with your requirements.

I am eager to bring my problem-solving ability to your engineering team. Thank you for your time and consideration.

Sincerely,
Placement Applicant`;
    }

    if (systemPrompt.includes('roadmap') || userPrompt.includes('Roadmap')) {
      return `### Learning Roadmap

#### Phase 1: Core Fundamentals (Weeks 1-4)
- **Topics**: Variables, Control structures, Scope, DOM, Basic Data Structures.
- **Resource**: freeCodeCamp / MDN Web Docs.
- **Goal**: Complete 5 basic practice scripts.

#### Phase 2: Architecture & State (Weeks 5-8)
- **Topics**: Components lifecycle, Hooks, State management, Routing.
- **Resource**: Official Documentation / React guides.
- **Goal**: Build a Todo Board or Weather app.

#### Phase 3: Backend & Databases (Weeks 9-12)
- **Topics**: SQL queries, REST Routing, ORMs, JWT Sessions.
- **Goal**: Deploy a full-stack dashboard with database integration.`;
    }

    // Default response for chat assistant questions
    return `### AI Placement Assistant Response

Based on your query: "${userPrompt.slice(0, 100)}...", here is my recommendation:

1. **Focus on Core Tech**: Master Data Structures and Algorithms (Strings, Arrays, Graphs) alongside DBMS and Operating Systems fundamentals.
2. **Project Completeness**: Build detailed projects with user logins, role access controls, and dashboard graphs.
3. **Practice Mock Tests**: Dedicate 30 minutes daily to logical reasoning, verbal aptitude, and SQL query syntax.`;
  }
}

export const aiService = new AiService();
