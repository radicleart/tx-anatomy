import * as btc from "@scure/btc-signer";
export declare function getNet(network: string): {
    bech32: string;
    pubKeyHash: number;
    scriptHash: number;
    wif: number;
};
export declare const REGTEST_NETWORK: typeof btc.NETWORK;
export declare function bitcoinToSats(amountBtc: number): number;
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
