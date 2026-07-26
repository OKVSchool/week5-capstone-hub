export const PROJECT_LANES = ["content site", "web app", "mobile app", "server", "database"] as const

export type Project = {
  id: string;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD"
  repoUrl?: string;
  tags?: string[];
  framework?: string;
  lanes?: string[];
  priority?: number;  // 1 (lowest) – 5 (highest)
  promotedFromIdeaId?: string;
  ideaWasFromThought?: boolean;
  createdAt?: string;
  status?: 'active' | 'archived' | 'orphaned';
};

