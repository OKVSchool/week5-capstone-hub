export type Project = {
  id: string;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD" — sorts correctly as a string
  repoUrl?: string;
  tags?: string[];
};

// TODO: Replace these with your actual course assignments
export const projects: Project[] = [
  {
    id: "1",
    title: "Example Project 1",
    description: "Replace this with your first course assignment.",
    date: "2026-06-01",
    repoUrl: "https://github.com/your-username/repo-name",
    tags: ["JavaScript", "HTML", "CSS"],
  },
  {
    id: "2",
    title: "Example Project 2",
    description: "Replace this with your second course assignment.",
    date: "2026-06-15",
    tags: ["React"],
  },
  {
    id: "3",
    title: "Course Project Hub",
    description: "Week-5 capstone: a hub for tracking all course projects.",
    date: "2026-07-15",
    repoUrl: "https://github.com/your-username/course-project-hub",
    tags: ["Next.js", "TypeScript", "Tailwind"],
  },
];
