export type Project = {
  id: string;
  title: string;
  description: string;
  date: string; // "YYYY-MM-DD" — sorts correctly as a string
  repoUrl?: string;
  tags?: string[];
};

export const projects: Project[] = [
  {
    id: "1",
    title: "Bio Website v1.0",
    description: "Personal bio content site",
    date: "2026-06-01",
  },
  {
    id: "2",
    title: "Bio Website v2.0",
    description: "2nd Personal bio content site",
    date: "2026-05-16",
  },
  {
    id: "3",
    title: "Calorie Website",
    description: "Content site about macros.",
    date: "2026-06-15",
  },
  {
    id: "4",
    title: "macroTracker v1.0",
    description: "First version of the diet journal app",
    date: "2026-07-15",
    repoUrl: "https://github.com/your-username/course-project-hub",
  },
  {
    id: "5",
    title: "macroTrackerFeedback",
    description: "User Feedback for for macroTrack app.",
    date: "2026-06-20",
    repoUrl: "https://github.com/OKVSchool/macroTrackFeedback.git",
  },
];
