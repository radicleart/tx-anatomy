import * as btc from "@scure/btc-signer";
import { hex } from "@scure/base";

const btcPrecision = 100000000;

export function getNet(network: string) {
  let net = btc.TEST_NETWORK;
  if (network === "devnet") net = REGTEST_NETWORK;
  else if (network === "mainnet") net = btc.NETWORK;
  return net;
}

export const REGTEST_NETWORK: typeof btc.NETWORK = {
  bech32: "bcrt",
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xc4,
};

export function bitcoinToSats(amountBtc: number) {
  return Math.round(amountBtc * btcPrecision);
}

/**
 * Ensure we don't overwrite the original object with Uint8Arrays these can't be serialised to local storage.
 * @param script
 * @returns
 */
export function fromStorable(script: any) {
  const clone = JSON.parse(JSON.stringify(script));
  if (typeof script.tweakedPubkey !== "string") return clone;
  return codifyScript(clone, true);
}

/**
 *
 * @param script
 * @returns
 */
export function toStorable(script: any) {
  //const copied = JSON.parse(JSON.stringify(script));
  return codifyScript(script, false);
}

function codifyScript(script: any, asString: boolean) {
  return {
    address: script.address,
    script: codify(script.script, asString),
    paymentType: script.type ? script.type : script.paymentType,
    witnessScript: codify(script.witnessScript, asString),
    redeemScript: codify(script.redeemScript, asString),
    leaves: script.leaves ? codifyLeaves(script.leaves, asString) : undefined,
    tapInternalKey: codify(script.tapInternalKey, asString),
    tapLeafScript: script.tapLeafScript
      ? codifyTapLeafScript(script.tapLeafScript, asString)
      : undefined,
    tapMerkleRoot: codify(script.tapMerkleRoot, asString),
    tweakedPubkey: codify(script.tweakedPubkey, asString),
  };
}

function codifyTapLeafScript(tapLeafScript: any, asString: boolean) {
  if (tapLeafScript[0]) {
    const level0 = tapLeafScript[0];
    if (level0[0])
      tapLeafScript[0][0].internalKey = codify(
        tapLeafScript[0][0].internalKey,
        asString
      );
    if (level0[0])
      tapLeafScript[0][0].merklePath[0] = codify(
        tapLeafScript[0][0].merklePath[0],
        asString
      );
    if (level0[1]) tapLeafScript[0][1] = codify(tapLeafScript[0][1], asString);
  }
  if (tapLeafScript[1]) {
    const level1 = tapLeafScript[1];
    if (level1[0])
      tapLeafScript[1][0].internalKey = codify(
        tapLeafScript[1][0].internalKey,
        asString
      );
    if (level1[0])
      tapLeafScript[1][0].merklePath[0] = codify(
        tapLeafScript[1][0].merklePath[0],
        asString
      );
    if (level1[1]) tapLeafScript[1][1] = codify(tapLeafScript[1][1], asString);
  }
  return tapLeafScript;
}

function codify(arg: unknown, asString: boolean) {
  if (!arg) return;
  if (typeof arg === "string") {
    return hex.decode(arg);
  } else {
    return hex.encode(arg as Uint8Array);
  }
}

function codifyLeaves(leaves: any, asString: boolean) {
  if (leaves[0]) {
    const level1 = leaves[0];
    if (level1.controlBlock)
      leaves[0].controlBlock = codify(leaves[0].controlBlock, asString);
    if (level1.hash) leaves[0].hash = codify(leaves[0].hash, asString);
    if (level1.script) leaves[0].script = codify(leaves[0].script, asString);
    if (level1.path && level1.path[0])
      leaves[0].path[0] = codify(leaves[0].path[0], asString);
  }
  if (leaves[1]) {
    const level1 = leaves[1];
    if (level1.controlBlock)
      leaves[1].controlBlock = codify(leaves[1].controlBlock, asString);
    if (level1.hash) leaves[1].hash = codify(leaves[1].hash, asString);
    if (level1.script) leaves[1].script = codify(leaves[1].script, asString);
    if (level1.path && level1.path[0])
      leaves[1].path[0] = codify(leaves[1].path[0], asString);
  }
  return leaves;
}

/**
 * getAddressFromOutScript converts a script to an address
 * @param network:string
 * @param script: Uint8Array
 * @returns address as string
 */
export function getAddressFromOutScript(
  network: string,
  script: Uint8Array
): string {
  const net = getNet(network);
  const outputScript = btc.OutScript.decode(script);

  if (outputScript.type === "pk" || outputScript.type === "tr") {
    return btc.Address(net).encode({
      type: outputScript.type,
      pubkey: outputScript.pubkey,
    });
  }
  if (outputScript.type === "ms" || outputScript.type === "tr_ms") {
    return btc.Address(net).encode({
      type: outputScript.type,
      pubkeys: outputScript.pubkeys,
      m: outputScript.m,
    });
  }
  if (outputScript.type === "tr_ns") {
    return btc.Address(net).encode({
      type: outputScript.type,
      pubkeys: outputScript.pubkeys,
    });
  }
  if (outputScript.type === "unknown") {
    return `${outputScript.type}::${hex.encode(script)}`;
  }
  return btc.Address(net).encode({
    type: outputScript.type,
    hash: outputScript.hash,
  });
}
