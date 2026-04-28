import { useState, useCallback, useEffect } from 'react';
import {
    useAccount,
    useBalance,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
    useSimulateContract,
} from 'wagmi';
import { formatUnits, maxUint256 } from 'viem';
import styles from '../styles/Home.module.css';
import { calculateValueWithBuffer } from '../utils';
import {
    MINTER_CONTRACT,
    USDH_CONTRACT,
    USDH_DECIMALS,
    REFERRAL_HASH,
    DURATION_YEARS,
    EXPLORER_TX_BASE,
    HLNAMES_BASE,
    MINTER_ABI,
    ERC20_ABI,
} from '../constants';
import type { Network, MintParams, PaymentToken } from '../types';

interface MintStepProps {
    mintParams: MintParams;
    domain: string;
    network: Network;
    paymentToken: PaymentToken;
}

type MintState = 'idle' | 'approving' | 'awaiting-approval' | 'pending' | 'confirming' | 'success' | 'error';

export function MintStep({ mintParams, domain, network, paymentToken }: MintStepProps) {
    const { address } = useAccount();
    const isUsdh = paymentToken === 'usdh';
    const minterAddress = MINTER_CONTRACT[network] as `0x${string}`;
    const usdhAddress = USDH_CONTRACT[network] as `0x${string}`;

    const [mintState, setMintState] = useState<MintState>('idle');
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>();
    const { writeContractAsync } = useWriteContract();

    // Native amount with 2% slippage buffer; ERC20 amount is exact (USDH oracle is 1:1).
    const amountRequiredExact = BigInt(mintParams.amountRequired);
    const requiredValueWithBuffer = calculateValueWithBuffer(mintParams.amountRequired);

    // Balance — native or USDH depending on token.
    const { data: nativeBalance } = useBalance({ address, query: { enabled: !isUsdh } });
    const { data: usdhBalance } = useReadContract({
        address: usdhAddress,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: { enabled: isUsdh && !!address },
    });

    const balanceValue = isUsdh ? (usdhBalance as bigint | undefined) : nativeBalance?.value;
    const requiredForBalance = isUsdh ? amountRequiredExact : requiredValueWithBuffer;
    const hasEnoughBalance = balanceValue !== undefined && balanceValue >= requiredForBalance;

    // USDH allowance — drives whether we need an approve tx first.
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: usdhAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, minterAddress] : undefined,
        query: { enabled: isUsdh && !!address },
    });
    const needsApproval =
        isUsdh && (allowance === undefined || (allowance as bigint) < amountRequiredExact);

    // Display helpers.
    const symbol = isUsdh ? 'USDH' : 'HYPE';
    const decimals = isUsdh ? USDH_DECIMALS : 18;
    const formattedAmount = Number(formatUnits(requiredForBalance, decimals)).toFixed(2);

    // Simulate the mint call (only meaningful once approval is in place and balance is sufficient).
    const { error: simulateError } = useSimulateContract(
        isUsdh
            ? {
                address: minterAddress,
                abi: MINTER_ABI,
                functionName: 'mintWithERC20',
                args: [
                    mintParams.label,
                    BigInt(DURATION_YEARS),
                    mintParams.sig,
                    BigInt(mintParams.timestamp),
                    usdhAddress,
                    REFERRAL_HASH as `0x${string}`,
                ],
                query: { enabled: hasEnoughBalance && !needsApproval },
            }
            : {
                address: minterAddress,
                abi: MINTER_ABI,
                functionName: 'mintWithNative',
                args: [
                    mintParams.label,
                    BigInt(DURATION_YEARS),
                    mintParams.sig,
                    BigInt(mintParams.timestamp),
                    REFERRAL_HASH as `0x${string}`,
                ],
                value: requiredValueWithBuffer,
                query: { enabled: hasEnoughBalance },
            },
    );

    // Wait for the approve tx to mine, then refetch allowance.
    const { isSuccess: isApproveConfirmed, isError: isApproveError } = useWaitForTransactionReceipt({
        hash: approveHash,
        query: { enabled: mintState === 'awaiting-approval' && !!approveHash },
    });

    useEffect(() => {
        if (mintState !== 'awaiting-approval' || !approveHash) return;
        if (isApproveConfirmed) {
            console.log('[Contract] USDH approval confirmed');
            setApproveHash(undefined);
            refetchAllowance().finally(() => setMintState('idle'));
        } else if (isApproveError) {
            console.warn('[Contract] USDH approval failed');
            setApproveHash(undefined);
            setMintState('error');
        }
    }, [mintState, approveHash, isApproveConfirmed, isApproveError, refetchAllowance]);

    // Wait for the mint tx to mine.
    const {
        isLoading: isWaitingForReceipt,
        isSuccess: isConfirmed,
        isError: isTxError,
        error: txError,
    } = useWaitForTransactionReceipt({
        hash: txHash,
        query: { enabled: mintState === 'confirming' && !!txHash },
    });

    useEffect(() => {
        if (mintState === 'confirming' && txHash) {
            if (isConfirmed) {
                console.log('[Contract] Transaction confirmed!');
                setMintState('success');
            } else if (isTxError && txError) {
                console.warn('[Contract] Transaction failed:', txError);
                setTxHash(undefined);
                setMintState('error');
            }
        }
    }, [mintState, txHash, isWaitingForReceipt, isConfirmed, isTxError, txError]);

    const handleApprove = useCallback(async () => {
        if (!isUsdh || !address) return;
        setMintState('approving');
        try {
            // Approve maxUint256 so subsequent mints by the same user skip this step entirely.
            // Trade-off vs an exact-amount approve: one less tx per future mint, slightly larger
            // approval surface area.
            console.log('[Contract] Approving USDH for', minterAddress);
            const hash = await writeContractAsync({
                address: usdhAddress,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [minterAddress, maxUint256],
            });
            console.log('[Contract] Approval submitted:', hash);
            setApproveHash(hash);
            setMintState('awaiting-approval');
        } catch (err) {
            console.warn('Approve error:', err);
            setMintState('idle');
        }
    }, [isUsdh, address, writeContractAsync, usdhAddress, minterAddress]);

    const handleMint = useCallback(async () => {
        if (!hasEnoughBalance || needsApproval) return;
        setMintState('pending');
        try {
            if (simulateError) {
                console.warn('Simulation error:', simulateError);
                setMintState('error');
                return;
            }

            console.log(
                '[Contract] Calling',
                isUsdh ? 'mintWithERC20' : 'mintWithNative',
                'on',
                minterAddress,
            );

            console.log('[Contract] Args:', {
                label: mintParams.label,
                durationInYears: DURATION_YEARS,
                sig: mintParams.sig,
                timestamp: mintParams.timestamp,
                ...(isUsdh ? { token: usdhAddress } : {}),
                referral: REFERRAL_HASH,
                ...(isUsdh ? {} : { value: requiredValueWithBuffer.toString() }),
            });

            const hash = isUsdh
                ? await writeContractAsync({
                    address: minterAddress,
                    abi: MINTER_ABI,
                    functionName: 'mintWithERC20',
                    args: [
                        mintParams.label,
                        BigInt(DURATION_YEARS),
                        mintParams.sig,
                        BigInt(mintParams.timestamp),
                        usdhAddress,
                        REFERRAL_HASH as `0x${string}`,
                    ],
                })
                : await writeContractAsync({
                    address: minterAddress,
                    abi: MINTER_ABI,
                    functionName: 'mintWithNative',
                    args: [
                        mintParams.label,
                        BigInt(DURATION_YEARS),
                        mintParams.sig,
                        BigInt(mintParams.timestamp),
                        REFERRAL_HASH as `0x${string}`,
                    ],
                    value: requiredValueWithBuffer,
                });

            console.log('[Contract] Transaction submitted:', hash);
            setTxHash(hash);
            setMintState('confirming');
        } catch (err) {
            console.warn('Mint error:', err);
            setMintState('idle');
        }
    }, [
        hasEnoughBalance,
        needsApproval,
        simulateError,
        isUsdh,
        minterAddress,
        usdhAddress,
        writeContractAsync,
        mintParams,
        requiredValueWithBuffer,
    ]);

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
                    {network === 'mainnet' && (
                        <a
                            href={`${EXPLORER_TX_BASE[network]}${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.successLink}
                        >
                            View transaction →
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // Approval sub-step (USDH only)
    if (needsApproval) {
        const approveDisabled =
            mintState === 'approving' || mintState === 'awaiting-approval' || !hasEnoughBalance;
        const approveText =
            mintState === 'approving'
                ? 'Confirm approval in wallet...'
                : mintState === 'awaiting-approval'
                    ? 'Waiting for approval...'
                    : !hasEnoughBalance
                        ? `Not enough ${symbol}, need ${formattedAmount} ${symbol}`
                        : `Approve ${symbol} (one-time)`;
        return (
            <>
                <button className={styles.mintButton} onClick={handleApprove} disabled={approveDisabled}>
                    {approveText}
                </button>
                {mintState === 'error' && (
                    <div className={styles.errorText}>
                        ✗ Approval failed, check console for details
                    </div>
                )}
            </>
        );
    }

    const getButtonText = () => {
        if (!hasEnoughBalance) return `Not enough ${symbol}, need ${formattedAmount} ${symbol}`;
        if (mintState === 'pending' || mintState === 'confirming') return 'Minting...';
        return `Mint now: ${formattedAmount} ${symbol}`;
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
