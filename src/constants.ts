export const API_KEY = "CPEPKMI-HUSUX6I-SE2DHEA-YYWFG5Y"

export const HLNAMES_BASE = {
  mainnet: "https://app.hlnames.xyz/name/",
  testnet: "https://testnet.hlnames.xyz/name/"
}

export const API_BASE = {
  mainnet: "https://api.hlnames.xyz",
  testnet: "http://localhost:4200",
}

export const EXPLORER_TX_BASE = {
  mainnet: "https://hyperevmscan.io/tx/",
  testnet: "no explorer available",
}

export const MINTER_CONTRACT = {
  mainnet: "0xb1d8b142c6B8C1738D0F522164D618218d53aB00",
  testnet: "0x39114061C1Fbd0d3E73CEd5eABf602D5d8813967",
}

// USDC (ERC20) token addresses per network. Used when the user picks "USDC" as the payment
// token. The on-chain Minter has a price oracle configured for these addresses, so the API
// will price the mint in USDC (6 decimals).
export const USDC_CONTRACT = {
  mainnet: "0xb88339CB7199b77E23DB6E890353E22632Ba630f",
  testnet: "0x2B3370eE501B4a559b57D449569354196457D8Ab",
} as const

export const USDC_DECIMALS = 6

// Referral code used for mint. This should be the namehash of a .hl name
export const REFERRAL_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000"

// Increase this to register the name for longer durations
export const DURATION_YEARS = 1

// It's recommended to add a 2% to the `amountRequired` to account for slippage.
// Unused funds are automatically refunded to the user.
// Only applied for native payments — ERC20 payments use the exact `amountRequired`.
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
  {
    name: "mintWithERC20",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "label", type: "string" },
      { name: "durationInYears", type: "uint256" },
      { name: "sig", type: "bytes" },
      { name: "timestamp", type: "uint256" },
      { name: "token", type: "address" },
      { name: "referral", type: "bytes32" },
    ],
    outputs: [],
  },
] as const

// Minimal ERC20 ABI for approve + allowance + balance lookups when paying with USDC.
export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const
