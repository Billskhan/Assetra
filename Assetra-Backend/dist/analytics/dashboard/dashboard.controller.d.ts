import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getPmDashboard(user: AuthUser): Promise<import("./dto/pm-dashboard.response").PmDashboardResponse>;
    getManagerDashboard(user: AuthUser): Promise<import("./dto/manager-dashboard.response").ManagerDashboardResponse>;
    getProjectDashboard(user: AuthUser, projectId: number): Promise<import("./dto/project-dashboard.response").ProjectDashboardResponse>;
    getApprovalQueue(user: AuthUser): Promise<import("./dto/approval-queue.response").ApprovalQueueResponse[]>;
    getVendorPerformance(user: AuthUser): Promise<import("./dto/vendor-performance.response").VendorPerformanceResponse[]>;
}
