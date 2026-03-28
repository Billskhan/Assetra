export interface Project {
  id: number;
  name: string;
  description?: string | null;
  budget: number;
  createdAt?: string | Date;
}

export interface ProjectSummary {
  id: number;
  name: string;
  budget: number;
}
