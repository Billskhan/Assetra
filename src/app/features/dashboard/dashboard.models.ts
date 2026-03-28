export interface PmRecentPendingTransaction {
  id: number;
  title: string;
  amount: number;
  createdAt: string | Date;
  projectName: string;
}

export interface PmDashboardResponse {
  pendingTransactions: number;
  pendingAmount: number;
  recentPendingTransactions: PmRecentPendingTransaction[];
}

export interface ManagerProjectSummary {
  projectId: number;
  projectName: string;
  budget: number;
  totalSpend: number;
  budgetUsedPercent: number;
}

export interface ManagerDashboardResponse {
  assignedProjects: number;
  pendingApprovalCount: number;
  projectSummaries: ManagerProjectSummary[];
}
