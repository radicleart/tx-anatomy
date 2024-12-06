export type PayloadType = {
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
