import type { AuthUser } from '../platform/auth/interfaces/auth-user.interface';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { RecordContractPaymentDto } from './dto/record-contract-payment.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
export declare class ContractsController {
    private readonly contractsService;
    constructor(contractsService: ContractsService);
    create(dto: CreateContractDto, user: AuthUser): Promise<{
        id: number;
        projectId: number;
        vendor: {
            name: string;
            id: number;
        };
        title: string;
        type: string | null;
        totalAmount: number;
        status: import(".prisma/client").$Enums.ContractStatus;
        milestones: {
            id: number;
            name: string;
            sequenceNo: number;
            amount: number;
            paidAmount: number;
            balance: number;
            status: import(".prisma/client").$Enums.ContractMilestoneStatus;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(user: AuthUser): Promise<{
        id: number;
        title: string;
        vendorId: number;
        vendorName: string;
        type: string | null;
        totalAmount: number;
        totalPaid: number;
        balance: number;
        status: import(".prisma/client").$Enums.ContractStatus;
        milestoneCount: number;
        paidMilestoneCount: number;
    }[]>;
    findByProject(projectId: number, user: AuthUser): Promise<{
        id: number;
        title: string;
        vendorId: number;
        vendorName: string;
        type: string | null;
        totalAmount: number;
        totalPaid: number;
        balance: number;
        status: import(".prisma/client").$Enums.ContractStatus;
        milestoneCount: number;
        paidMilestoneCount: number;
    }[]>;
    recordPayment(dto: RecordContractPaymentDto, user: AuthUser): Promise<{
        payment: {
            id: number;
            milestoneId: number | null;
            milestoneName: string | null;
            milestoneSequenceNo: number | null;
            paymentDate: Date;
            amount: number;
            paymentMode: import("./dto/record-contract-payment.dto").ContractPaymentModeDto | null;
            receiptNo: string | null;
            remarks: string | null;
            createdAt: Date;
        };
        totals: {
            totalAmount: number;
            totalPaid: number;
            balance: number;
        };
        status: "ACTIVE" | "COMPLETED";
    }>;
    getPayments(contractId: number, user: AuthUser): Promise<{
        contractId: number;
        totalAmount: number;
        totalPaid: number;
        balance: number;
        payments: {
            id: number;
            milestoneId: number | null;
            milestoneName: string | null;
            milestoneSequenceNo: number | null;
            paymentDate: Date;
            amount: number;
            paymentMode: import("./dto/record-contract-payment.dto").ContractPaymentModeDto | null;
            receiptNo: string | null;
            remarks: string | null;
            createdAt: Date;
        }[];
    }>;
    findOne(contractId: number, user: AuthUser): Promise<{
        id: number;
        projectId: number;
        title: string;
        type: string | null;
        scopeOfWork: string | null;
        totalAmount: number;
        startDate: Date | null;
        expectedEndDate: Date | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.ContractStatus;
        vendor: {
            email: string | null;
            name: string;
            id: number;
            phone: string | null;
        };
        totals: {
            totalAmount: number;
            totalPaid: number;
            balance: number;
        };
        milestones: {
            id: number;
            name: string;
            sequenceNo: number;
            targetValue: number | null;
            unit: string | null;
            amount: number;
            paidAmount: number;
            balance: number;
            status: import(".prisma/client").$Enums.ContractMilestoneStatus;
            completedOn: Date | null;
            remarks: string | null;
        }[];
        payments: {
            id: number;
            milestoneId: number | null;
            milestoneName: string | null;
            milestoneSequenceNo: number | null;
            paymentDate: Date;
            amount: number;
            paymentMode: import("./dto/record-contract-payment.dto").ContractPaymentModeDto | null;
            receiptNo: string | null;
            remarks: string | null;
            createdAt: Date;
        }[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(contractId: number, dto: UpdateContractDto, user: AuthUser): Promise<{
        id: number;
        updatedAt: Date;
        startDate: Date | null;
        title: string;
        type: string | null;
        scopeOfWork: string | null;
        expectedEndDate: Date | null;
        notes: string | null;
        status: import(".prisma/client").$Enums.ContractStatus;
    }>;
}
