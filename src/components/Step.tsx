import styles from '../styles/Home.module.css';
import type { StepStatus } from '../types';

interface StepProps {
  status: StepStatus;
  text: string;
  errorMessage?: string;
}

export function Step({ status, text, errorMessage }: StepProps) {
  if (status === 'idle') return null;

  return (
    <div className={styles.step}>
      <div className={styles.stepIcon}>
        {status === 'loading' && <div className={styles.spinner} />}
        {status === 'pending' && <span className={styles.stepPending}>!</span>}
        {status === 'success' && <span className={styles.stepSuccess}>✓</span>}
        {status === 'error' && <span className={styles.stepError}>✗</span>}
      </div>
      <div className={styles.stepText}>
        <div className={
          status === 'success' ? styles.stepSuccess : 
          status === 'error' ? styles.stepError : 
          status === 'pending' ? styles.stepPending : ''
        }>
          {text}
        </div>
        {status === 'error' && errorMessage && (
          <div className={styles.errorText}>{errorMessage}</div>
        )}
      </div>
    </div>
  );
}
