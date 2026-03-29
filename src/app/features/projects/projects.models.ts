export interface Project {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  budget?: number | null;
  organizationId?: number;
  createdById?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ProjectSummary {
  id: number;
  name: string;
  budget: number;
}
