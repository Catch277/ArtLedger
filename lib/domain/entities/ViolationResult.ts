import type { ViolationScenario } from './ViolationScenario';

export interface ViolationResult {
  scenario: ViolationScenario;
  applicable: boolean;
  blocked: boolean;
  reason: string | null;
  tokenId: string | null;
  tokenUri: string | null;
}