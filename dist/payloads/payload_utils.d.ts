import * as btc from "@scure/btc-signer";
import { PayloadType } from "../types";
/**
 * Mainnet magic
 * 5832 => X2
 * Testnet magic
 * hex     utf8
 * 4e33 => NE
 * 5432 => T2
 * 4845 => HE ??
 * 5255 => RU ??
 */
export declare const MAGIC_BYTES_TESTNET = "5432";
export declare const MAGIC_BYTES_TESTNET_NAK = "4e33";
export declare const MAGIC_BYTES_MAINNET = "5832";
export declare const MAGIC_BYTES_MAINNET_NAK = "5832";
export declare const PEGIN_OPCODE = "3C";
export declare const PEGOUT_OPCODE = "3E";
export declare function getNet(network: string): {
    bech32: string;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
};
export declare const REGTEST_NETWORK: typeof btc.NETWORK;
export declare function bitcoinToSats(amountBtc: number): number;
export declare function parseRawPayload(network: string, d0: string, vout1Address: string | undefined, sigMode: "rsv" | "vrs"): PayloadType;
export declare function parseDepositPayload(d1: Uint8Array): PayloadType;
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
export declare function buildDepositPayload(network: string, stacksAddress: string): string;
export declare function buildDepositPayloadOpDrop(network: string, stacksAddress: string, revealFee: number): string;
/**
 * @param network (testnet|mainnet)
 * @param amount
 * @param signature
 * @returns
 */
export declare function buildWithdrawPayload(network: string, amount: number, signature: string): string;
/**
 * Withdrawal using commit reveal (op_drop) pattern
 * @param network (testnet|mainnet)
 * @param amount
 * @param signature
 * @returns
 */
export declare function buildWithdrawPayloadOpDrop(network: string, amount: number, signature: string): string;
export declare function readDepositValue(outputs: Array<any>): number;
export declare function parsePayloadFromOutput(network: string, tx: btc.Transaction): PayloadType;
/**
 *
 * @param network
 * @param amount
 * @param bitcoinAddress
 * @returns
 */
export declare function getDataToSign(network: string, amount: number, bitcoinAddress: string): string;
export declare function getMagicAndOpCode(d1: Uint8Array): {
    magic?: string;
    opcode: string;
    txType?: string;
};
/**
 * Ensure we don't overwrite the original object with Uint8Arrays these can't be serialised to local storage.
 * @param script
 * @returns
 */
export declare function fromStorable(script: any): any;
/**
 *
 * @param script
 * @returns
 */
export declare function toStorable(script: any): {
    address: any;
    script: string | Uint8Array<ArrayBufferLike> | undefined;
    paymentType: any;
    witnessScript: string | Uint8Array<ArrayBufferLike> | undefined;
    redeemScript: string | Uint8Array<ArrayBufferLike> | undefined;
    leaves: any;
    tapInternalKey: string | Uint8Array<ArrayBufferLike> | undefined;
    tapLeafScript: any;
    tapMerkleRoot: string | Uint8Array<ArrayBufferLike> | undefined;
    tweakedPubkey: string | Uint8Array<ArrayBufferLike> | undefined;
};
/**
 * getAddressFromOutScript converts a script to an address
 * @param network:string
 * @param script: Uint8Array
 * @returns address as string
 */
export declare function getAddressFromOutScript(network: string, script: Uint8Array): string;
