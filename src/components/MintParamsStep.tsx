import { useEffect } from 'react';
import { Step } from './Step';
import { fetchMintPass } from '../utils';
import type { Network, StepStatus, MintParams, PaymentToken } from '../types';

interface MintParamsStepProps {
  label: string;
  network: Network;
  paymentToken: PaymentToken;
  status: StepStatus;
  errorMessage: string;
  onStatusChange: (status: StepStatus) => void;
  onErrorChange: (error: string) => void;
  onSuccess: (params: MintParams) => void;
}

export function MintParamsStep({
  label,
  network,
  paymentToken,
  status,
  errorMessage,
  onStatusChange,
  onErrorChange,
  onSuccess,
}: MintParamsStepProps) {
  useEffect(() => {
    if (status !== 'loading') return;

    const getMintParams = async () => {
      try {
        const params = await fetchMintPass(label, network, paymentToken);
        onStatusChange('success');
        onSuccess(params);
      } catch (err) {
        console.warn('Mint params error:', err);
        onStatusChange('error');
        onErrorChange('Failed to get mint parameters');
      }
    };

    getMintParams();
  }, [status, label, network, paymentToken, onStatusChange, onErrorChange, onSuccess]);

  return (
    <Step
      status={status}
      text="Getting mint params..."
      errorMessage={errorMessage}
    />
  );
}
