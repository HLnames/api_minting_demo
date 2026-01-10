import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAccount, useChainId } from 'wagmi';
import styles from '../styles/Home.module.css';
import { getNetwork, parseAndNormalizeName } from '../utils';
import { Step } from '../components/Step';
import { NameCheckStep } from '../components/NameCheckStep';
import { MintParamsStep } from '../components/MintParamsStep';
import { MintStep } from '../components/MintStep';
import type { StepStatus, MintParams } from '../types';

type Theme = 'system' | 'light' | 'dark';

const Home: NextPage = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const network = getNetwork(chainId);
  const prevNetworkRef = useRef(network);

  // Theme state
  const [theme, setTheme] = useState<Theme>('system');

  // Apply theme to document
  useEffect(() => {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setTheme((current) => {
      if (current === 'dark') return 'light';
      // If system or light, switch to dark
      return 'dark';
    });
  }, []);

  // Check if dark mode is active
  const isDarkMode = theme === 'dark';

  // State
  const [searchInput, setSearchInput] = useState('');
  const [currentLabel, setCurrentLabel] = useState('');
  const [currentDomain, setCurrentDomain] = useState('');

  // Step states
  const [validateStatus, setValidateStatus] = useState<StepStatus>('idle');
  const [validateError, setValidateError] = useState('');
  const [mintParamsStatus, setMintParamsStatus] = useState<StepStatus>('idle');
  const [mintParamsError, setMintParamsError] = useState('');
  const [mintParams, setMintParams] = useState<MintParams | null>(null);

  // Reset all state
  const resetState = useCallback(() => {
    setCurrentLabel('');
    setCurrentDomain('');
    setValidateStatus('idle');
    setValidateError('');
    setMintParamsStatus('idle');
    setMintParamsError('');
    setMintParams(null);
  }, []);

  // Start search programmatically
  const triggerSearch = useCallback(() => {
    // Parse and normalize name
    const parsed = parseAndNormalizeName(searchInput);
    if ('error' in parsed) {
      setValidateStatus('error');
      setValidateError(parsed.error);
      return;
    }

    const { label, domain } = parsed;
    setCurrentLabel(label);
    setCurrentDomain(domain);

    // Start validation step
    setValidateStatus('loading');
  }, [searchInput]);

  // Watch for network changes and re-trigger search
  useEffect(() => {
    if (prevNetworkRef.current !== network) {
      prevNetworkRef.current = network;

      // If there's an active search, reset and re-trigger
      if (searchInput.trim()) {
        resetState();
        // Small delay to ensure state is reset before triggering
        setTimeout(() => {
          triggerSearch();
        }, 0);
      }
    }
  }, [network, searchInput, resetState, triggerSearch]);

  // Handle search
  const handleSearch = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;

    // Reset state for new search
    resetState();
    triggerSearch();
  }, [resetState, triggerSearch]);

  // Handle name check success - start mint params step
  const handleNameCheckSuccess = useCallback(() => {
    setMintParamsStatus('loading');
  }, []);

  // Handle mint params success
  const handleMintParamsSuccess = useCallback((params: MintParams) => {
    setMintParams(params);
  }, []);

  // Determine if we should show mint step
  const showMintStep = mintParamsStatus === 'success' && mintParams;

  return (
    <div className={styles.container}>
      <Head>
        <title>Minting Demo</title>
        <meta content="3rd-party minting demo for Hyperliquid Names" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <div className={styles.themeToggle}>
        <label className={styles.toggleLabel}>
          <span className={styles.toggleIcon}>☀️</span>
          <input
            type="checkbox"
            className={styles.toggleInput}
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          <span className={styles.toggleSlider}></span>
          <span className={styles.toggleIcon}>🌙</span>
        </label>
      </div>

      <div className={styles.header}>
        <ConnectButton />
      </div>

      <main className={styles.main}>
        <h1 className={styles.title}>Mint .hl names from anywhere!</h1>
        <p className={styles.description}>
          This demo applications shows how to mint .hl names from anywhere. Search for a name to get started. Open the dev console for additional details.
        </p>
        <div className={styles.links}>
          <a href="https://github.com/HLnames/api_minting_demo" target="_blank" rel="noopener noreferrer" className={styles.link}>
            See the source code for this application →
          </a>
          <a href="https://github.com/HLnames/api_minting_demo" target="_blank" rel="noopener noreferrer" className={styles.link}>
            Read the developer docs →
          </a>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for a .hl name"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>

        {(validateStatus !== 'idle' || mintParamsStatus !== 'idle') && (
          <div className={styles.stepsContainer}>
            {/* Step 1: Name Check */}
            <NameCheckStep
              domain={currentDomain}
              network={network}
              status={validateStatus}
              errorMessage={validateError}
              onStatusChange={setValidateStatus}
              onErrorChange={setValidateError}
              onSuccess={handleNameCheckSuccess}
            />

            {/* Step 2: Mint Params */}
            <MintParamsStep
              label={currentLabel}
              network={network}
              status={mintParamsStatus}
              errorMessage={mintParamsError}
              onStatusChange={setMintParamsStatus}
              onErrorChange={setMintParamsError}
              onSuccess={handleMintParamsSuccess}
            />

            {/* Step 3: Mint - only show when wallet is connected */}
            {showMintStep && isConnected && (
              <MintStep
                mintParams={mintParams}
                domain={currentDomain}
                network={network}
              />
            )}

            {/* Prompt to connect wallet if mint params ready but not connected */}
            {showMintStep && !isConnected && (
              <Step status="pending" text="Connect your wallet to mint" />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
