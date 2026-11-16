import { ContractNotConfiguredError } from '@/lib/domain/errors/ContractNotConfiguredError';
import type { ViolationResult } from '@/lib/domain/entities/ViolationResult';
import type { ViolationScenario } from '@/lib/domain/entities/ViolationScenario';
import type { IArtworkQueryGateway } from '@/lib/domain/ports/IArtworkQueryGateway';
import type { IArtworkWriteGateway } from '@/lib/domain/ports/IArtworkWriteGateway';
import type { WalletAddress } from '@/lib/domain/types/eth';

export interface SimulateViolationInput {
  scenario: ViolationScenario;
  actor: WalletAddress;
  tokenId?: string;
}

export class SimulateViolationUseCase {
  constructor(
    private readonly query: IArtworkQueryGateway,
    private readonly writer: IArtworkWriteGateway,
  ) {}

  async execute(input: SimulateViolationInput): Promise<ViolationResult> {
    if (!this.query.isConfigured()) throw new ContractNotConfiguredError();
    const total = await this.query.getTotalSupply();

    if (total === 0) {
      return {
        scenario: input.scenario,
        applicable: false,
        blocked: false,
        reason: 'Chưa có tác phẩm nào trên chuỗi để mô phỏng.',
        tokenId: null,
        tokenUri: null,
      };
    }

    if (input.scenario === 'duplicate-mint') {
      const tokenId = String(total);
      const tokenUri = await this.query.getTokenUri(tokenId);
      const simulation = await this.writer.simulateMint(tokenUri, input.actor);
      return {
        scenario: input.scenario,
        applicable: true,
        blocked: !simulation.ok,
        reason: simulation.revertReason,
        tokenId,
        tokenUri,
      };
    }

    const tokenId = input.tokenId && /^[1-9]\d*$/.test(input.tokenId) ? input.tokenId : String(total);
    const simulation = await this.writer.simulateTransfer(tokenId, input.actor);
    const tokenUri = await this.query.getTokenUri(tokenId).catch(() => null);
    return {
      scenario: input.scenario,
      applicable: true,
      blocked: !simulation.ok,
      reason: simulation.revertReason,
      tokenId,
      tokenUri,
    };
  }
}