import { GovernanceData } from './dao';
export type SbtcUserSettingI = {
    executiveTeamMember: boolean;
    govTokens?: GovernanceData;
    useOpDrop: boolean;
    peggingIn: boolean;
    debugMode: boolean;
    testAddress?: string;
    currency: {
        cryptoFirst: boolean;
        myFiatCurrency: ExchangeRate;
        denomination: string;
    };
};
export type SbtcClarityEvent = {
    _id: string;
    contractId: string;
    eventIndex: number;
    txid: string;
    bitcoinTxid: {
        notification: {
            type: string;
            value: string;
        };
        payload: {
            type: string;
            value: string;
        };
    };
    payloadData: PayloadType;
};
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
export type SbtcContractDataType = {
    coordinator?: {
        addr: {
            value: string;
        };
        key: string;
    };
    contractId: string;
    contractOwner: string;
    sbtcWalletAddress?: string;
    sbtcWalletPublicKey: string;
    numKeys?: number;
    numParties?: number;
    tradingHalted?: boolean;
    tokenUri?: string;
    threshold?: number;
    totalSupply?: number;
    decimals?: number;
    name?: string;
    burnHeight?: number;
};
export type AddressValidationI = {
    isvalid: boolean;
    address: string;
    scriptPubKey: string;
    isscript: boolean;
    iswitness: boolean;
    witness_version: number;
    witness_program: string;
};
export type BridgeTransactionType = {
    _id?: string;
    eventId?: string;
    network: string;
    originator: string;
    uiPayload: DepositPayloadUIType | WithdrawPayloadUIType;
    status: number;
    created: number;
    updated: number;
    tries?: number;
    mode: string;
    requestType: string;
    btcTxid?: string;
    commitTxScript?: CommitmentScriptDataType;
    vout0?: VoutI;
    vout?: VoutI;
};
export type RevealOrReclaim = {
    btcTxid?: string;
    signedPsbtHex?: string;
};
export type CommitmentScriptDataType = {
    address?: string;
    script: string | Uint8Array | undefined;
    paymentType: string;
    redeemScript?: string | Uint8Array;
    witnessScript?: string | Uint8Array;
    wsh?: string;
    leaves?: any;
    tapInternalKey?: string | Uint8Array;
    tapLeafScript?: any;
    tapMerkleRoot?: string | Uint8Array;
    tweakedPubkey?: string | Uint8Array;
};
export type VoutI = {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
};
export type PegInData = {
    requestData?: BridgeTransactionType;
    confirmations?: number;
    burnHeight?: number;
    stacksAddress?: string;
    sbtcWalletAddress: string;
    amount: number;
    revealFee: number;
};
export type CommitKeysI = {
    fromBtcAddress: string;
    sbtcWalletAddress: string;
    revealPub: string;
    reclaimPub: string;
    stacksAddress: string;
};
export type AddressObject = {
    stxAddress: string;
    cardinal: string;
    ordinal: string;
    sBTCBalance: number;
    tokenBalances?: TokenBalances;
    walletBalances?: WalletBalances;
    stxBalance?: number;
    bnsNameInfo?: any;
    cardinalInfo?: AddressMempoolObject;
    ordinalInfo?: AddressMempoolObject;
    btcPubkeySegwit0?: string;
    btcPubkeySegwit1?: string;
};
export type WalletBalances = {
    stacks: {
        address: string;
        amount: number;
    };
    cardinal: {
        address: string;
        amount: number;
    };
    ordinal: {
        address: string;
        amount: number;
    };
};
export type AddressMempoolObject = {
    address: string;
    chain_stats: {
        funded_txo_count: number;
        funded_txo_sum: number;
        spent_txo_count: number;
        spent_txo_sum: number;
        tx_count: number;
    };
    mempool_stats: {
        funded_txo_count: number;
        funded_txo_sum: number;
        spent_txo_count: number;
        spent_txo_sum: number;
        tx_count: number;
    };
};
export type TokenBalances = {
    stx: {
        balance: number;
        total_sent: number;
        total_received: number;
        lock_tx_id: string;
        locked: number;
        lock_height: number;
        burnchain_lock_height: number;
        burnchain_unlock_height: number;
    };
    fungible_tokens: any;
    non_fungible_tokens: any;
};
export type Message = {
    script: Uint8Array;
    signature?: Uint8Array | string;
};
export type UTXO = {
    txid: string;
    vout: number;
    fullout?: {
        scriptpubkey: string;
        scriptpubkey_address: string;
        scriptpubkey_asm: string;
        scriptpubkey_type: string;
        value: number;
    };
    tx: any;
    status: {
        confirmed: boolean;
        block_height?: number;
        block_hash?: string;
        block_time?: number;
    };
    value: number;
};
export type SbtcAlphaEvent = {
    contractId: string;
    eventIndex: string;
    txid: string;
    bitcoinTxid: string;
    payloadData: PayloadType;
};
export type KeySet = {
    deposits: {
        revealPubKey: string;
        reclaimPubKey: string;
        oraclePubKey: string;
    };
};
export type StxSignature = {
    signature: string;
    publicKey: string;
    message: string;
};
export type WrappedPSBT = {
    depositId: string;
    txtype: string;
    broadcastResult?: any;
    signedTransaction?: string;
    signedPsbt?: string;
    stxSignature?: StxSignature;
};
export type ExchangeRate = {
    _id: string;
    currency: string;
    fifteen: number;
    last: number;
    buy: number;
    sell: number;
    symbol: string;
    name: string;
};
export type AuthorisationDataType = {
    signature: string;
    publicKey: string;
    stxAddress: string;
    amountSats: number;
};
export interface PayloadUIType {
    sbtcWalletPublicKey: string;
    reclaimPublicKey: string;
    paymentPublicKey: string;
}
export interface DepositPayloadUIType extends PayloadUIType {
    bitcoinAddress: string;
    principal: string;
    amountSats: number;
}
export interface WithdrawPayloadUIType extends DepositPayloadUIType {
    signature?: string | undefined;
}
export type TxMinedParameters = {
    proofElements: Array<any>;
    height: number;
    txIndex: number;
    headerHex: string;
    txIdR: string;
    treeDepth: number;
};
export interface FeeEstimateResponse {
    feeInfo: {
        low_fee_per_kb: number;
        medium_fee_per_kb: number;
        high_fee_per_kb: number;
    };
}
export interface BalanceI {
    balance: number;
}
export interface UIObject {
    keys: KeySet;
    sbtcContractData: SbtcContractDataType;
    rates: Array<ExchangeRate>;
}
