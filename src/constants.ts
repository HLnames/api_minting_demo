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
  mainnet: "0xb1d8b142c6B8C1738D0F522164D618218d53aB00",
  testnet: "0x39114061C1Fbd0d3E73CEd5eABf602D5d8813967",
}

// Referral code used for mint. This should be the namehash of a .hl name
export const REFERRAL_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000"

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
