export type PayloadType = {
    magic: MagicCode;
    data: string | SbtcPayloadType;
};
export type SbtcPayloadType = {
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
    data: string | PayloadType | SbtcPayloadType;
    type: string;
    protocol: string;
    amount?: bigint;
};
