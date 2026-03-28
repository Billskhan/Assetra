export interface PmDashboardResponse {
  pendingTransactions: number;
  pendingAmount: number;
  recentPendingTransactions: Array<{
    id: number;
    title: string;
    amount: number;
    createdAt: Date;
    projectName: string;
  }>;
}
