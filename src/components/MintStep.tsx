import { useState, useCallback, useEffect } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from 'wagmi';
import { formatUnits } from 'viem';
import styles from '../styles/Home.module.css';
import { calculateValueWithBuffer } from '../utils';
import {
    MINTER_CONTRACT,
    REFERRAL_HASH,
    DURATION_YEARS,
    EXPLORER_TX_BASE,
    HLNAMES_BASE,
    MINTER_ABI,
} from '../constants';
import type { Network, MintParams } from '../types';

interface MintStepProps {
    mintParams: MintParams;
    domain: string;
    network: Network;
}

export function MintStep({ mintParams, domain, network }: MintStepProps) {
    const { address } = useAccount();
    const { data: balance } = useBalance({ address });
    const [mintState, setMintState] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle');
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const requiredValue = calculateValueWithBuffer(mintParams.amountRequired);
    const hasEnoughBalance = balance ? balance.value >= requiredValue : false;
    const formattedHype = Number(formatUnits(requiredValue, 18)).toFixed(2);
    const { writeContractAsync } = useWriteContract();

    const { error: simulateError } = useSimulateContract({
        address: MINTER_CONTRACT[network] as `0x${string}`,
        abi: MINTER_ABI,
        functionName: 'mintWithNative',
        args: [
            mintParams.label,
            BigInt(DURATION_YEARS),
            mintParams.sig,
            BigInt(mintParams.timestamp),
            REFERRAL_HASH as `0x${string}`,
        ],
        value: requiredValue,
        query: {
            enabled: hasEnoughBalance,
        },
    });

    const { 
        isLoading: isWaitingForReceipt,
        isSuccess: isConfirmed, 
        isError: isTxError, 
        error: txError 
    } = useWaitForTransactionReceipt({
        hash: txHash,
        query: {
            enabled: mintState === 'confirming' && !!txHash,
        },
    });

    // Handle transaction confirmation result
    useEffect(() => {
        if (mintState === 'confirming' && txHash) {
            if (isConfirmed) {
                console.log('[Contract] Transaction confirmed!');
                setMintState('success');
            } else if (isTxError && txError) {
                console.warn('[Contract] Transaction failed:', txError);
                setTxHash(undefined); // Clear hash so we can retry
                setMintState('error');
            }
        }
    }, [mintState, txHash, isWaitingForReceipt, isConfirmed, isTxError, txError]);

    // Handle mint
    const handleMint = useCallback(async () => {
        if (!hasEnoughBalance) return;

        setMintState('pending');

        try {
            // Simulate first
            if (simulateError) {
                console.warn('Simulation error:', simulateError);
                setMintState('error');
                return;
            }

            // Send transaction
            console.log('[Contract] Calling mintWithNative on', MINTER_CONTRACT[network]);
            console.log('[Contract] Args:', {
                label: mintParams.label,
                durationInYears: DURATION_YEARS,
                sig: mintParams.sig,
                timestamp: mintParams.timestamp,
                referral: REFERRAL_HASH,
                value: requiredValue.toString(),
            });

            const hash = await writeContractAsync({
                address: MINTER_CONTRACT[network] as `0x${string}`,
                abi: MINTER_ABI,
                functionName: 'mintWithNative',
                args: [
                    mintParams.label,
                    BigInt(DURATION_YEARS),
                    mintParams.sig,
                    BigInt(mintParams.timestamp),
                    REFERRAL_HASH as `0x${string}`,
                ],
                value: requiredValue,
            });

            console.log('[Contract] Transaction submitted:', hash);
            setTxHash(hash);
            setMintState('confirming');
        } catch (err) {
            console.warn('Mint error:', err);
            setMintState('idle');
        }
    }, [hasEnoughBalance, simulateError, writeContractAsync, network, mintParams, requiredValue]);

    if (mintState === 'success' && txHash) {
        return (
            <div className={styles.successContainer}>
                <div className={styles.successTitle}>Success!</div>
                <div className={styles.successLinks}>
                    <a
                        href={`${HLNAMES_BASE[network]}${domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.successLink}
                    >
                        {HLNAMES_BASE[network]}{domain}
                    </a>
                    <a
                        href={`${EXPLORER_TX_BASE[network]}${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.successLink}
                    >
                        View transaction →
                    </a>
                </div>
            </div>
        );
    }

    const getButtonText = () => {
        if (!hasEnoughBalance) return `Not enough HYPE, need ${formattedHype} HYPE`;
        if (mintState === 'pending' || mintState === 'confirming') return 'Minting...';
        return `Mint now: ${formattedHype} HYPE`;
    };

    const canMint = hasEnoughBalance && (mintState === 'idle' || mintState === 'error');

    return (
        <>
            <button
                className={styles.mintButton}
                onClick={handleMint}
                disabled={!canMint}
            >
                {getButtonText()}
            </button>
            {mintState === 'error' && (
                <div className={styles.errorText}>
                    ✗ Transaction failed, check console for details
                </div>
            )}
        </>
    );
}
