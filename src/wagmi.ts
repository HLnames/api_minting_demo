import { Chain, getDefaultConfig } from '@rainbow-me/rainbowkit';

const hyperliquidTestnet = {
  id: 998,
  name: 'HyperEVM Testnet',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm'],
    },
    public: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm'],
    },
  },
  testnet: true,
} as const satisfies Chain;

const hyperliquidMainnet = {
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: {
    name: 'HYPE',
    symbol: 'HYPE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
    public: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  testnet: false,
} as const satisfies Chain;


export const config = getDefaultConfig({
  appName: 'Hyperliquid Names API Minting Demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    hyperliquidTestnet,
    hyperliquidMainnet
  ],
  ssr: true,
});
