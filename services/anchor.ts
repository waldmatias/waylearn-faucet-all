import idl from "../idl/idl.json" with { type: "json"}

export function decodeAnchorError(errorCode: number) {
    const errorMsg = idl.errors?.find(e => e.code === errorCode);

    if (errorMsg) {
        return {
            name: errorMsg.code, 
            msg: errorMsg.msg, 
            code: errorCode,
        }
    }

    return {
        name: "unknown", 
        msg: "Unknown program error", 
        code: errorCode, 
    }
}

export async function getAnchorDiscriminator(name: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(`global:${name}`));

    return new Uint8Array(hashBuffer).slice(0, 8); // get 8 bytes
}
