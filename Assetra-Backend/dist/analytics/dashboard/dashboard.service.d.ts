import { PrismaService } from '../../platform/prisma/prisma.service';
import { AuthUser } from '../../platform/auth/interfaces/auth-user.interface';
import { ApprovalQueueResponse } from './dto/approval-queue.response';
import { ManagerDashboardResponse } from './dto/manager-dashboard.response';
import { PmDashboardResponse } from './dto/pm-dashboard.response';
import { ProjectDashboardResponse } from './dto/project-dashboard.response';
import { VendorPerformanceResponse } from './dto/vendor-performance.response';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getPmDashboard(user: AuthUser): Promise<PmDashboardResponse>;
    getManagerDashboard(user: AuthUser): Promise<ManagerDashboardResponse>;
    getProjectDashboard(projectId: number, user: AuthUser): Promise<ProjectDashboardResponse>;
    getApprovalQueue(user: AuthUser): Promise<ApprovalQueueResponse[]>;
    getVendorPerformance(user: AuthUser): Promise<VendorPerformanceResponse[]>;
}
