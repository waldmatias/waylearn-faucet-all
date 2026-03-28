import { createSolanaRpc, createSolanaRpcSubscriptions, devnet } from "@solana/kit";

export const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
export const rpcSubscriptions = createSolanaRpcSubscriptions(devnet("wss://api.devnet.solana.com"));
