import type { Category } from "./thoughts"

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueBy?: string;
  category?: Category;
  done: boolean;
  projectId?: string;
  ideaId?: string;
  thoughtId?: string;
  createdAt?: string;
}
