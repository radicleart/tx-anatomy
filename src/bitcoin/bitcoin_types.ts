import { Inscription } from "micro-ordinals";

export type PayloadType = {
  magic: MagicCode;
  data: string;
};
export type InscriptionPayloadType = {
  magic: MagicCode;
  data: Inscription[] | undefined;
};
export type SbtcPayloadType = {
  magic: MagicCode;
  data: SbtcPayloadDetails | undefined;
};
export type SbtcPayloadDetails = {
  magic: MagicCode;
  sbtcWallet?: string;
  txIndex?: number;
  burnBlockHeight?: number;
  burnBlockTime?: number;
  spendingAddress?: string;
  opcode?: string;
  prinType?: number;
  stacksAddress?: string;
  lengthOfCname?: number;
  cname?: string;
  lengthOfMemo?: number;
  memo?: string;
  revealFee?: number;
  amountSats: number;
  signature?: string;
  dustAmount?: number;
  eventType?: string;
};

export type MagicCode = {
  magic?: string;
  opcode: string;
  txType?: string;
};
export type TransactionOutput = {
  data: string | PayloadType | SbtcPayloadType | InscriptionPayloadType;
  type: string;
  protocol: string;
  amount?: bigint;
};
