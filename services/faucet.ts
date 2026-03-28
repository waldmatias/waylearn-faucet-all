import { AccountRole, address, appendTransactionMessageInstruction, assertIsSendableTransaction, assertIsTransactionMessageWithBlockhashLifetime, createTransactionMessage, KeyPairSigner, pipe, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, Signature, signTransactionMessageWithSigners } from "@solana/kit";
import { getSigner, broadcast, getLatestBlockHash } from "./solana.ts";
import { decodeAnchorError, getAnchorDiscriminator } from "./anchor.ts";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";

const FAUCET_PROGRAM_ID = address(Deno.env.get("FAUCET_PROGRAM_ID") ?? "");
const PDA = {
    CONFIG: Deno.env.get("PDA_CONFIG") ?? "",
    VAULT: Deno.env.get("PDA_VAULT") ?? "",
}

export const transferTokens = async (recipient: string) => {
    const signer = await getSigner();

    return await solDrop(signer, recipient);
}

const buildTransactionMessage = async (feePayer: KeyPairSigner, recipient: string) => {
    const fnDiscriminator = await getAnchorDiscriminator(`sol_drop`);

    const { value: latestBlockhash } = await getLatestBlockHash();    

    return pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayerSigner(feePayer, m), // fee payer
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
        (m) => appendTransactionMessageInstruction(
            {
                programAddress: FAUCET_PROGRAM_ID,
                accounts: [
                    { address: address(PDA.CONFIG), role: AccountRole.READONLY }, // Read-only
                    { address: address(PDA.VAULT), role: AccountRole.WRITABLE }, // Writable
                    { address: address(recipient), role: AccountRole.WRITABLE }, // Writable
                    { address: SYSTEM_PROGRAM_ADDRESS, role: AccountRole.READONLY }, // System Program
                ],
                data: fnDiscriminator, // Anchor discriminator
            },
            m,
        ),
    );
}

const solDrop = async (feePayer: KeyPairSigner, recipient: string): Promise<Signature> => {

    const transactionMessage = await buildTransactionMessage(feePayer, recipient);

    const transaction = await signTransactionMessageWithSigners(transactionMessage);

    assertIsTransactionMessageWithBlockhashLifetime(transactionMessage);
    assertIsSendableTransaction(transaction);   

    try {
        return await broadcast(transaction);
    } catch (error) {
        // hack it for Anchor, using the program's IDL
        // we could also use the .logs([])
        const anchorError = decodeAnchorError(error.cause.context.code)

        console.log(`Anchor code: ${anchorError.code}, ${anchorError.msg}`);

        throw new Error(anchorError.msg);
    }
}

