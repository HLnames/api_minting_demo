export const API_KEY = "CPEPKMI-HUSUX6I-SE2DHEA-YYWFG5Y"

export const HLNAMES_BASE = {
  mainnet: "https://app.hlnames.xyz/name/",
  testnet: "https://testnet.hlnames.xyz/name/"
}

export const API_BASE = {
  mainnet: "https://api.hlnames.xyz",
  testnet: "https://api.testnet.hlnames.xyz",
}

export const EXPLORER_TX_BASE = {
  mainnet: "https://hyperevmscan.io/tx/",
  testnet: "https://testnet.purrsec.com/tx/"
}

export const MINTER_CONTRACT = {
  mainnet: "0x1DcB56cD62989c718D92FB71112371050b272CA9",
  testnet: "0x39114061C1Fbd0d3E73CEd5eABf602D5d8813967",
}

// Referral code used for mint. This should be the namehash of a .hl name
export const REFERRAL_HASH = "0x8acffb3b49d50c2796803fe985a1cdc3d98b7ce109b73e663b2f86a0f34efd7c"

// Increase this to register the name for longer durations
export const DURATION_YEARS = 1

// It's recommended to add a 2% to the `amountRequired` to account for slippage.
// Unused funds are automatically refunded to the user.
export const VALUE_BUFFER_BPS = 200 // 2%

// Minter contract ABI
export const MINTER_ABI = [
  {
    name: "mintWithNative",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "label", type: "string" },
      { name: "durationInYears", type: "uint256" },
      { name: "sig", type: "bytes" },
      { name: "timestamp", type: "uint256" },
      { name: "referral", type: "bytes32" },
    ],
    outputs: [],
  },
] as const
