export interface ManagerDashboardResponse {
  assignedProjects: number;
  pendingApprovalCount: number;
  projectSummaries: Array<{
    projectId: number;
    projectName: string;
    budget: number;
    totalSpend: number;
    budgetUsedPercent: number;
  }>;
}
