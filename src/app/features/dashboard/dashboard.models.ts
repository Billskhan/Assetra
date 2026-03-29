export interface PmDashboardSummary {
  totalProjects: number;
  totalVendors: number;
  totalStakeholders: number;
}

export interface PmDashboardProject {
  id: number;
  name: string;
  location: string;
  budget: number;
  status: string;
}

export interface PmDashboardVendor {
  id: number;
  name: string;
  category: string;
  activeContracts: number;
  region: string;
}

export interface PmDashboardStakeholder {
  id: number;
  name: string;
  role: string;
  organization: string;
}

export interface PmDashboardView {
  summary: PmDashboardSummary;
  projects: PmDashboardProject[];
  vendors: PmDashboardVendor[];
  stakeholders: PmDashboardStakeholder[];
}
