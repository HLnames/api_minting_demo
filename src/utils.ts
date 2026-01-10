import { normalize } from 'viem/ens';
import { API_KEY, API_BASE, VALUE_BUFFER_BPS } from './constants';
import type { Network, MintParams } from './types';

// Helper to get network from chain ID
export function getNetwork(chainId: number | undefined): Network {
  return chainId === 999 ? 'mainnet' : 'testnet';
}

// Helper to parse and normalize name
export function parseAndNormalizeName(input: string): { label: string; domain: string } | { error: string } {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) {
    return { error: 'Please enter a name' };
  }

  // Remove .hl suffix if present
  let label = trimmed;
  if (label.endsWith('.hl')) {
    label = label.slice(0, -3);
  }

  // Check for subdomains (not allowed)
  if (label.includes('.')) {
    return { error: 'Subdomains are not allowed' };
  }

  // ENS normalize
  try {
    label = normalize(label);
  } catch {
    return { error: 'Invalid name' };
  }

  return { label, domain: `${label}.hl` };
}

// Convert the domain name to namehash
export async function fetchNamehash(domain: string, network: Network): Promise<string> {
  const url = `${API_BASE[network]}/utils/namehash/${domain}`;
  console.log(`[API] GET ${url}`);
  
  const res = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'X-API-Key': API_KEY,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn('Namehash API error:', res.status, text);
    throw new Error('Failed to get namehash');
  }
  const data = await res.json();
  console.log('[API] Namehash response:', data);
  return data.nameHash;
}

// Check if name is already registered
export async function checkRegistered(namehash: string, network: Network): Promise<boolean> {
  const url = `${API_BASE[network]}/utils/registered/${namehash}`;
  console.log(`[API] GET ${url}`);
  
  const res = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'X-API-Key': API_KEY,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn('Registered check API error:', res.status, text);
    throw new Error('Failed to check registration');
  }
  const data = await res.json();
  console.log('[API] Registered check response:', data);
  return data.registered;
}

// Fetch the mint parameters for the given label
export async function fetchMintPass(label: string, network: Network): Promise<MintParams> {
  const url = `${API_BASE[network]}/api/private/sign_mintpass/${label}`;
  console.log(`[API] POST ${url}`);
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'X-API-Key': API_KEY,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn('Mintpass API error:', res.status, text);
    throw new Error('Failed to get mint parameters');
  }
  const data = await res.json();
  console.log('[API] Mint pass response:', data);
  return data;
}

// Add buffer to the amountRequired returned from sign_mintpass
export function calculateValueWithBuffer(amountRequired: string): bigint {
  const amount = BigInt(amountRequired);
  const buffer = (amount * BigInt(VALUE_BUFFER_BPS)) / BigInt(10000);
  return amount + buffer;
}
