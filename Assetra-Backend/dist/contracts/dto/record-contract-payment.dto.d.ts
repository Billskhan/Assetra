export declare enum ContractPaymentModeDto {
    CASH = "CASH",
    BANK = "BANK",
    ONLINE = "ONLINE",
    CHEQUE = "CHEQUE"
}
export declare class RecordContractPaymentDto {
    contractId: number;
    milestoneId?: number;
    paymentDate: string;
    amount: number;
    paymentMode?: ContractPaymentModeDto;
    receiptNo?: string;
    remarks?: string;
}
