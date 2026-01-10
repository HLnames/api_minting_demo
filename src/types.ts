export type Network = 'mainnet' | 'testnet';
export type StepStatus = 'idle' | 'loading' | 'success' | 'error' | 'pending';

export interface MintParams {
  label: string;
  sig: `0x${string}`;
  timestamp: number;
  token: string;
  amountRequired: string;
}
