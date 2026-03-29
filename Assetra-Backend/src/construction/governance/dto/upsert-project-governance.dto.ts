import { IsBoolean } from 'class-validator';

export class UpsertProjectGovernanceDto {
  @IsBoolean()
  requireContractApproval!: boolean;

  @IsBoolean()
  requirePaymentApproval!: boolean;

  @IsBoolean()
  requireTxApproval!: boolean;
}
