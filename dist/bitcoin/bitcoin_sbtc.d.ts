import * as btc from "@scure/btc-signer";
import { SbtcPayloadType } from "./bitcoin_types";
export declare function parseRawSbtcPayload(network: string, d0: string, vout1Address: string | undefined, sigMode: "rsv" | "vrs"): SbtcPayloadType;
export declare function parseSbtcWithdrawPayload(network: string, d0: string, bitcoinAddress: string, sigMode: "rsv" | "vrs"): SbtcPayloadType;
export declare function getStacksSimpleHashOfDataToSign(network: string, amount: number, bitcoinAddress: string): string;
/**
 *
 * @param messageHash
 * @param signature
 * @returns
 */
export declare function getStacksAddressFromSignature(messageHash: Uint8Array, signature: string): {
    tp2pkh: string;
    tp2sh: string;
    mp2pkh: string;
    mp2sh: string;
};
export declare function getStacksAddressFromSignatureRsv(messageHash: Uint8Array, signature: string): {
    tp2pkh: string;
    tp2sh: string;
    mp2pkh: string;
    mp2sh: string;
};
export declare function getStacksAddressFromPubkey(pubkey: Uint8Array): {
    tp2pkh: string;
    tp2sh: string;
    mp2pkh: string;
    mp2sh: string;
};
export declare function parseSbtcDepositPayload(d1: Uint8Array): SbtcPayloadType;
export declare function amountToUint8(amt: number, size: number): Uint8Array;
/**
export function uint8ToAmount(buf:Uint8Array):number {
    const hmmm = hex.decode(hex.encode(buf)) // needed to make work ?
    const view = new DataView(hmmm.buffer);
    const amt = view.getUint32(0);
    return amt;
}
 */
export declare function amountToBigUint64(amt: number, size: number): Uint8Array<ArrayBufferLike>;
export declare function bigUint64ToAmount(buf: Uint8Array): number;
export declare enum PrincipalType {
    STANDARD = "05",
    CONTRACT = "06"
}
export declare function readDepositValue(outputs: Array<any>): number;
export declare function parseSbtcPayloadFromOutput(network: string, tx: btc.Transaction): SbtcPayloadType;
/**
 *
 * @param network
 * @param amount
 * @param bitcoinAddress
 * @returns
 */
export declare function getDataToSign(network: string, amount: number, bitcoinAddress: string): string;
