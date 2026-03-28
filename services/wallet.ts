import { createKeyPairSignerFromPrivateKeyBytes } from "@solana/kit";

/**
 * Derives a deterministic signer from an email string.
 */
export async function getWalletFromEmail(email: string) {
    const encoder = new TextEncoder();
    const emailBytes = encoder.encode(
        email.toLowerCase().trim() + Deno.env.get("APP_SECRET"),
    );

    const hashBuffer = await crypto.subtle.digest("SHA-256", emailBytes);
    const seed = new Uint8Array(hashBuffer);

    const signer = await createKeyPairSignerFromPrivateKeyBytes(seed);

    return {
        address: signer.address, // The Public Key (Base58 string)
        signer: signer, // The object used to sign transactions
    };
}

/**
 * Derives a deterministic signer from an email string and password.
 */
export async function getWalletSecure(email: string, password: string) {
    const encoder = new TextEncoder();
    const salt = encoder.encode(
        email.trim().toLowerCase() + Deno.env.get("APP_SECRET"),
    );

    const passwordKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"],
    );

    const pbkdf2Bufer = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100_000, // std
            hash: "SHA-256",
        },
        passwordKey,
        256,
    );

    const signer = await createKeyPairSignerFromPrivateKeyBytes(
        new Uint8Array(pbkdf2Bufer),
    );

    return {
        address: signer.address, // The Public Key (Base58 string)
        signer: signer, // The object used to sign transactions
    };
}
