import { MagicCode, TransactionOutput } from "./bitcoin_types";
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
export declare function parseRawTransaction(network: string, txHex: string): Array<TransactionOutput>;
export declare function parseOutput(network: string, script: string): TransactionOutput;
export declare function getMagicAndOpCode(d1: Uint8Array): MagicCode;
