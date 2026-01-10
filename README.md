# Hyperliquid Names Minting Demo

Try the demo at: https://demo.hlnames.xyz

This is a demo application for minting .hl names using the HLnames API. Supports both testnet and mainnet.

Reach out to us if you have any questions or want to integrate!

## Flow

The minting process follows these steps:

1. **Normalize and namehash the name** - Call [`/utils/namehash/{domain}`](src/utils.ts#L39) to normalize and hash the domain name.

2. **Check if the name is registered** - Call [`/utils/registered/{namehash}`](src/utils.ts#L60) to verify if the name is already registered.

3. **Fetch mint parameters** - Call [`/api/sign_mintpass/{label}`](src/utils.ts#L81) to retrieve the signed mint parameters required for the transaction.

4. **Execute mint transaction** - Call [`mintWithNative`](src/components/MintStep.tsx#L100) to submit the on-chain transaction minter contract.

## Getting Started

Install dependencies and run the development server:

```bash
pnpm install
pnpm run dev
```

## Resources

- [Mintpass Documentation](https://github.com/HLnames/hln_api_minting)
- [Developer Documentation](https://hyperliquid-names.gitbook.io/hyperliquid-names/dapp-integration/dapp-integration)
