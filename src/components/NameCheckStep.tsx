import { useEffect } from 'react';
import { Step } from './Step';
import { fetchNamehash, checkRegistered } from '../utils';
import type { Network, StepStatus } from '../types';

interface NameCheckStepProps {
  domain: string;
  network: Network;
  status: StepStatus;
  errorMessage: string;
  onStatusChange: (status: StepStatus) => void;
  onErrorChange: (error: string) => void;
  onSuccess: () => void;
}

export function NameCheckStep({
  domain,
  network,
  status,
  errorMessage,
  onStatusChange,
  onErrorChange,
  onSuccess,
}: NameCheckStepProps) {
  useEffect(() => {
    if (status !== 'loading') return;

    const checkAvailability = async () => {
      try {
        const namehash = await fetchNamehash(domain, network);
        const registered = await checkRegistered(namehash, network);

        if (registered) {
          onStatusChange('error');
          onErrorChange('This name is already registered');
          return;
        }

        onStatusChange('success');
        onSuccess();
      } catch (err) {
        console.warn('Validation error:', err);
        onStatusChange('error');
        onErrorChange('Failed to check availability');
      }
    };

    checkAvailability();
  }, [status, domain, network, onStatusChange, onErrorChange, onSuccess]);

  return (
    <Step
      status={status}
      text="Checking availability..."
      errorMessage={errorMessage}
    />
  );
}
