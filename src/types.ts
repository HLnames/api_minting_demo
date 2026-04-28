export type Network = 'mainnet' | 'testnet';
export type StepStatus = 'idle' | 'loading' | 'success' | 'error' | 'pending';
export type PaymentToken = 'native' | 'usdh';

export interface MintParams {
  label: string;
  sig: `0x${string}`;
  timestamp: number;
  // "native" or a checksummed ERC20 address (e.g. USDH).
  token: string;
  // Denominated in the chosen token's base units (wei for native, 6 decimals for USDH).
  amountRequired: string;
}
