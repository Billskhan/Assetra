export interface ProjectDashboardResponse {
  project: {
    id: number;
    name: string;
    budget: number;
  };
  financial: {
    budget: number;
    totalSpend: number;
    remainingBudget: number;
    budgetUsedPercent: number;
  };
  execution: {
    stageCount: number;
    transactionCount: number;
    pendingApprovals: number;
  };
  topVendors: Array<{
    vendorName: string;
    totalSpend: number;
  }>;
}
