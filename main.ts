import { transferTokens } from "./services/faucet.ts";

const reqAddress = ``;

console.log(`Requesting SOL for ${reqAddress}`);

try {
    const signature = await transferTokens(reqAddress);

    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);    
} catch (error) {
    console.log(`Error: ${error.message}`);
}
