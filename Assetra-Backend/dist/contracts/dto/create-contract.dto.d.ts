export declare class CreateContractMilestoneDto {
    name: string;
    sequenceNo: number;
    targetValue?: number;
    unit?: string;
    amount: number;
    remarks?: string;
}
export declare class CreateContractDto {
    projectId: number;
    vendorId: number;
    title: string;
    type?: string;
    scopeOfWork?: string;
    totalAmount: number;
    startDate?: string;
    expectedEndDate?: string;
    notes?: string;
    milestones: CreateContractMilestoneDto[];
}
