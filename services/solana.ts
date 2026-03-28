import { createKeyPairSignerFromBytes, getBase64Codec, getSignatureFromTransaction, SendableTransaction, sendAndConfirmTransactionFactory } from "@solana/kit";
import { rpc, rpcSubscriptions } from "./network.ts"

export const getSigner = async () => {
    const secretKey = getBase64Codec().encode(Deno.env.get("APP_SIGNER") ?? "");

    const signer = await createKeyPairSignerFromBytes(secretKey);    

    console.log(`Signer: ${signer.address}`);

    return signer; 
}

export const getLatestBlockHash = async () => {
    return await rpc.getLatestBlockhash().send();
}

const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions});

export const broadcast = async (signedTransaction: SendableTransaction) => {
    try {
        const signature = getSignatureFromTransaction(signedTransaction);
        console.log(`${signature}`);

        await sendAndConfirm(signedTransaction, {
            commitment: "confirmed", 
            skipPreflight: false,
        });

        return signature;
    } catch (error) {
        console.log(`broadcast error: logs: ${(error.context?.logs)}`);

        throw error;
    }
}