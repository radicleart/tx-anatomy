export type DashboardInfoI = {
    poxCycle: number;
    totalDeposited: number;
    totalWithdrawn: number;
    countTotal: number;
    countDeposits: number;
    countWithdrawals: number;
    countHandoffs: number;
};
export declare const REWARD_CYCLE_LENGTH = 2000;
export declare const PREPARE_CYCLE_LENGTH = 100;
export type PoxCycleInfo = {
    firstBlockHeight: number;
    lastBlockHeight: number;
    firstBlockTime: number;
    lastBlockTime: number;
    rewardSetSize: number;
    numbEntriesRewardCyclePoxList: number;
    totalPoxRejection: number;
    totalUstxStacked: number;
};
export type StacksInfo = {
    peer_version: number;
    pox_consensus: string;
    burn_block_height: number;
    stable_pox_consensus: string;
    stable_burn_block_height: number;
    server_version: string;
    network_id: number;
    parent_network_id: number;
    stacks_tip_height: number;
    stacks_tip: string;
    stacks_tip_consensus_hash: string;
    genesis_chainstate_hash: string;
    unanchored_tip?: number;
    unanchored_seq?: null;
    exit_at_block_height?: null;
    node_public_key: string;
    node_public_key_hash: string;
    affirmations: {
        heaviest: string;
        stacks_tip: string;
        sortition_tip: string;
        tentative_best: string;
    };
    last_pox_anchor: {
        anchor_block_hash: string;
        anchor_block_txid: string;
    };
};
export type BlockchainInfo = {
    stacksInfo: StacksInfo;
    poxInfo: PoxInfo;
    mainnetTipHeight: number;
    sbtcWindow: string;
};
export type StackerInfo = {
    stacksAddress: string;
    stacker?: Stacker;
    delegation?: Delegation;
    poxRejection: PoxRejection;
    cycle?: number;
    cycleInfo?: any;
    poxStackerInfo?: Array<StackerInfo>;
};
export type Stacker = {
    poxAddr?: PoxAddress;
    lockPeriod: Array<{
        value: number;
    }>;
    firstRewardCycle: number;
    rewardSetIndexes: Array<{
        type: string;
        value: number;
    }>;
    delegatedTo?: string;
    bitcoinAddr?: string;
};
export type PoxRejection = {
    poxRejectionPerStackerPerCycle: number;
};
export type Delegation = {
    amountUstx: number;
    delegatedTo?: string;
    untilBurnHt?: number;
    poxAddr?: PoxAddress;
    bitcoinAddr?: string;
};
export type PoxInfo = {
    contract_id: string;
    pox_activation_threshold_ustx: number;
    first_burnchain_block_height: number;
    current_burnchain_block_height: number;
    prepare_phase_block_length: number;
    reward_phase_block_length: number;
    reward_slots: number;
    rejection_fraction: number;
    total_liquid_supply_ustx: number;
    current_cycle: {
        id: number;
        min_threshold_ustx: number;
        stacked_ustx: number;
        is_pox_active: boolean;
    };
    next_cycle: {
        id: number;
        min_threshold_ustx: number;
        min_increment_ustx: number;
        stacked_ustx: number;
        prepare_phase_start_block_height: number;
        blocks_until_prepare_phase: number;
        reward_phase_start_block_height: number;
        blocks_until_reward_phase: number;
        ustx_until_pox_rejection: number;
    };
    min_amount_ustx: number;
    prepare_cycle_length: number;
    reward_cycle_id: number;
    reward_cycle_length: number;
    rejection_votes_left_required: number;
    next_reward_cycle_in: number;
    contract_versions: Array<PoxContractVersion>;
    epochs: Array<PoxEpoch>;
};
export type PoxEpoch = {
    epoch_id: string;
    start_height: number;
    end_height: number;
    block_limit: {
        write_length: number;
        write_count: number;
        read_length: number;
        read_count: number;
        runtime: number;
    };
    network_epoch: number;
};
export type PoxContractVersion = {
    contract_id: string;
    activation_burnchain_block_height: number;
    first_reward_cycle_id: number;
};
export type RewardSlot = {
    _id?: string;
    canonical: boolean;
    address: string;
    burn_block_hash: string;
    cycle: number;
    burn_block_height: number;
    slot_index: number;
};
export type AddressRewardSlot = {
    _id?: string;
    canonical: boolean;
    burn_block_hash: string;
    burn_block_height: number;
    burn_amount: number;
    reward_amount: number;
    reward_recipient: string;
};
export type PoxEntry = {
    index: number;
    cycle: number;
    bitcoinAddr?: string;
    poxAddr?: PoxAddress;
    stacker: string;
    totalUstx: number;
    delegations: number;
};
export type PoxAddress = {
    version: string;
    hashBytes: string;
};
export type PoolStackerEvent = {
    _id?: string;
    poxContractName?: string;
    eventIndex: number;
    event: string;
    locked: number;
    balance: number;
    stacker: string;
    bitcoinAddr?: string;
    burnchainUnlockHeight: number;
    data: DelegationStx | RevokeDelegateStx | DelegationAggregationIncrease | DelegationStackExtend | DelegationStackStx | DelegationStackIncrease | StackStx | StackIncrease | StackExtend | HandleUnlock;
};
export type HandleUnlock = {
    amountUstx: number;
    firstCycleLocked: number;
    firstUnlockedCycle: number;
    poxAddr?: PoxAddress;
};
export type RevokeDelegateStx = {
    amountUstx: number;
    delegator?: string | undefined;
    endCycleId?: number | undefined;
    startCycleId: number;
};
export type DelegationStx = {
    amountUstx: number;
    delegator: string;
    poxAddr?: PoxAddress;
    unlockBurnHeight: number;
};
export type DelegationAggregationIncrease = {
    amountUstx: number;
    delegator?: string;
    poxAddr?: PoxAddress;
    rewardCycle: number;
};
export type DelegationStackExtend = {
    amountUstx: number;
    delegator: string;
    extendCount: number;
    poxAddr: PoxAddress;
    stacker: string;
    unlockBurnHeight: number;
};
export type DelegationStackIncrease = {
    amountUstx: number;
    delegator: string;
    increaseBy: number;
    poxAddr: PoxAddress;
    stacker: string;
    totalLocked: number;
};
export type DelegationStackStx = {
    amountUstx: number;
    delegator: string;
    lockAmount: number;
    lockPeriod: number;
    poxAddr?: PoxAddress;
    stacker: string;
    startBurnHeight: number;
    unlockBurnHeight: number;
};
export type StackStx = {
    amountUstx?: number;
    lockAmount: number;
    lockPeriod: number;
    poxAddr?: PoxAddress;
    startBurnHeight: number;
    unlockBurnHeight: number;
};
export type StackIncrease = {
    amountUstx?: number;
    increaseBy: number;
    poxAddr?: PoxAddress;
    totalLocked: number;
};
export type StackAggregationCommit = {
    amountUstx?: number;
    delegator?: string;
    poxAddr?: PoxAddress;
    rewardCycle: number;
};
export type StackExtend = {
    amountUstx?: number;
    extendCount: number;
    poxAddr?: PoxAddress;
    unlockBurnHeight: number;
};
export type DelegationStackAggregationCommitIndexed = {
    amountUstx?: number;
    delegator?: string;
    poxAddr?: PoxAddress;
    rewardCycle: number;
};
