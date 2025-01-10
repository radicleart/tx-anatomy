import * as btc from "@scure/btc-signer";
import { hex } from "@scure/base";
import { c32address, c32addressDecode } from "c32check";
import { sha256 } from "@noble/hashes/sha256";
import { ripemd160 } from "@noble/hashes/ripemd160";
import * as P from "micro-packed";
import { MagicCode, PayloadType, SbtcPayloadDetails } from "./bitcoin_types";
import { concatBytes } from "@stacks/common";
import { hashMessage } from "@stacks/encryption";
import {
  PubKeyEncoding,
  publicKeyFromSignatureRsv,
  publicKeyFromSignatureVrs,
} from "@stacks/transactions";
import {
  bitcoinToSats,
  getAddressFromOutScript,
  getNet,
} from "./bitcoin_utils";
import { getMagicAndOpCode, PEGIN_OPCODE } from "./bitcoin_parsing";

export function parseRawSbtcPayload(
  network: string,
  d0: string,
  vout1Address: string | undefined,
  sigMode: "rsv" | "vrs"
): SbtcPayloadDetails {
  let d1 = hex.decode(d0).subarray(4);
  let magicOp = getMagicAndOpCode(d1);
  if (magicOp.opcode !== "3C" && magicOp.opcode !== "3E") {
    d1 = hex.decode(d0).subarray(5);
    magicOp = getMagicAndOpCode(d1);
  }
  if (magicOp.opcode === "3C") {
    const payload = parseSbtcDepositPayload(d1);
    return payload;
  } else if (magicOp.opcode === "3E") {
    try {
      if (vout1Address)
        return parseSbtcWithdrawPayload(
          network,
          hex.encode(d1),
          vout1Address,
          sigMode
        );
      else
        throw new Error(
          "Withdrawal requires the address from output 1: " + magicOp.opcode
        );
    } catch (err: any) {
      return {
        magic: magicOp,
        opcode: "3E",
        prinType: 0,
        stacksAddress: undefined,
        lengthOfCname: 0,
        cname: undefined,
        lengthOfMemo: 0,
        memo: undefined,
        revealFee: 0,
        amountSats: 0,
      };
    }
  } else {
    throw new Error("Wrong opcode: " + magicOp.opcode);
  }
}

export function parseSbtcWithdrawPayload(
  network: string,
  d0: string,
  bitcoinAddress: string,
  sigMode: "rsv" | "vrs"
): SbtcPayloadDetails {
  const d1 = hex.decode(d0);
  const magicOp: MagicCode = getMagicAndOpCode(d1);
  if (magicOp.magic) {
    return parseWithdrawalPayloadNoMagic(
      network,
      d1.subarray(2),
      bitcoinAddress,
      sigMode
    );
  }
  return parseWithdrawalPayloadNoMagic(network, d1, bitcoinAddress, sigMode);
}

function parseWithdrawalPayloadNoMagic(
  network: string,
  d1: Uint8Array,
  bitcoinAddress: string,
  sigMode: "rsv" | "vrs"
): SbtcPayloadDetails {
  const opcode = hex.encode(d1.subarray(0, 1)).toUpperCase();
  if (opcode !== "3E")
    throw new Error("Wrong opcode for withdraw: should be 3E was " + opcode);
  const amtB = d1.subarray(1, 9);
  const amountSats = bigUint64ToAmount(amtB);
  let signature = hex.encode(d1.subarray(9, 74));
  const msgHash = getStacksSimpleHashOfDataToSign(
    network,
    amountSats,
    bitcoinAddress
  );
  let stacksAddress: string | undefined;
  try {
    const pubKey = getPubkeySignature(hex.decode(msgHash), signature, sigMode);
    console.log("parseWithdrawalPayloadNoMagic:pubKey: " + hex.encode(pubKey));
    const stxAddresses = getStacksAddressFromPubkey(pubKey);
    stacksAddress =
      network === network ? stxAddresses.tp2pkh : stxAddresses.mp2pkh;
  } catch (err: any) {
    //
  }
  return {
    magic: {} as MagicCode,
    opcode,
    stacksAddress,
    signature,
    amountSats,
  };
}
export function getStacksSimpleHashOfDataToSign(
  network: string,
  amount: number,
  bitcoinAddress: string
): string {
  const dataToSign = getDataToSign(network, amount, bitcoinAddress);
  const msgHash = hashMessage(dataToSign);
  return hex.encode(msgHash);
}
function getPubkeySignature(
  messageHash: Uint8Array,
  signature: string,
  sigMode: "vrs" | "rsv" | undefined
) {
  let pubkey = publicKeyFromSignatureVrs(
    hex.encode(messageHash),
    signature,
    PubKeyEncoding.Compressed
  );
  if (sigMode === "rsv") {
    pubkey = publicKeyFromSignatureRsv(
      hex.encode(messageHash),
      signature,
      PubKeyEncoding.Compressed
    );
  }
  return hex.decode(pubkey);
}

/**
 *
 * @param messageHash
 * @param signature
 * @returns
 */
export function getStacksAddressFromSignature(
  messageHash: Uint8Array,
  signature: string
) {
  const pubkey = getPubkeySignature(messageHash, signature, "vrs");
  return getStacksAddressFromPubkey(pubkey);
}

export function getStacksAddressFromSignatureRsv(
  messageHash: Uint8Array,
  signature: string
) {
  const pubkey = getPubkeySignature(messageHash, signature, "rsv");
  return getStacksAddressFromPubkey(pubkey);
}

export function getStacksAddressFromPubkey(pubkey: Uint8Array) {
  const addresses = {
    tp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2PKH),
    tp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2SH),
    mp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2PKH),
    mp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2SH),
  };
  //console.log('getStacksAddressFromPubkey: addresses: ', addresses)
  return addresses;
}

function publicKeyToStxAddress(
  publicKey: Uint8Array,
  addressVersion: StacksNetworkVersion = StacksNetworkVersion.mainnetP2PKH
): string {
  return c32address(addressVersion, hex.encode(hash160(publicKey)));
}

enum StacksNetworkVersion {
  mainnetP2PKH = 22, // 'P'   MainnetSingleSig
  mainnetP2SH = 20, // 'M'    MainnetMultiSig
  testnetP2PKH = 26, // 'T'   TestnetSingleSig
  testnetP2SH = 21, // 'N'    TestnetMultiSig
}

export function parseSbtcDepositPayload(d1: Uint8Array): SbtcPayloadDetails {
  const magicOp = getMagicAndOpCode(d1);
  if (magicOp.magic) {
    return parseDepositPayloadNoMagic(d1.subarray(2));
  }
  return parseDepositPayloadNoMagic(d1);
}

function parseDepositPayloadNoPrincipal(d1: Uint8Array): SbtcPayloadDetails {
  const opcode = hex.encode(d1.subarray(0, 1)).toUpperCase();
  const addr0 = parseInt(hex.encode(d1.subarray(1, 2)), 16);
  const addr1 = hex.encode(d1.subarray(2, 22));
  const stacksAddress = c32address(addr0, addr1);
  return {
    magic: {} as MagicCode,
    opcode,
    prinType: 0,
    stacksAddress,
    lengthOfCname: 0,
    cname: undefined,
    lengthOfMemo: 0,
    memo: undefined,
    revealFee: 0,
    amountSats: 0,
  };
}

function parseDepositPayloadNoMagic(d1: Uint8Array): SbtcPayloadDetails {
  //console.log('payload rev: ', hex.encode(d1))
  const opcode = hex.encode(d1.subarray(0, 1)).toUpperCase();
  if (opcode.toUpperCase() !== PEGIN_OPCODE)
    throw new Error(
      "Wrong OPCODE : expected: " + PEGIN_OPCODE + "  received: " + opcode
    );

  const prinType = parseInt(hex.encode(d1.subarray(1, 2)), 16);
  if (prinType === 22 || prinType === 26)
    return parseDepositPayloadNoPrincipal(d1);
  const addr0 = parseInt(hex.encode(d1.subarray(2, 3)), 16);
  const addr1 = hex.encode(d1.subarray(3, 23));
  const stacksAddress = c32address(addr0, addr1);
  const lengthOfCname = parseInt(hex.encode(d1.subarray(23, 24)), 8);
  let cname;
  if (lengthOfCname > 0) {
    cname = new TextDecoder().decode(d1.subarray(24, 24 + lengthOfCname));
  }

  let current = 24 + lengthOfCname;
  //let memo;
  //const lengthOfMemo = parseInt(hex.encode(d1.subarray(current, current + 1)), 8);
  //if (lengthOfMemo > 0) {
  //	memo = new TextDecoder().decode(d1.subarray(current + 1, lengthOfMemo + current + 1));
  //}

  let revealFee = 0;
  if (d1.length > current + 1) {
    // + lengthOfMemo) {
    //current = current + 1 + lengthOfMemo;
    const rev = d1.subarray(current);
    console.log("parseDepositPayloadNoMagic: " + hex.encode(rev));
    revealFee = bigUint64ToAmount(rev);
    console.log("parseDepositPayloadNoMagic:revealFee: " + revealFee);
  }

  return {
    magic: {} as MagicCode,
    opcode,
    prinType,
    stacksAddress,
    lengthOfCname,
    cname,
    lengthOfMemo: 0,
    memo: undefined,
    revealFee,
    amountSats: 0,
  };
}

export function amountToUint8(amt: number, size: number): Uint8Array {
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  view.setUint8(0, amt); // Max unsigned 32-bit integer
  const res = new Uint8Array(view.buffer);
  return res;
}

/**
export function uint8ToAmount(buf:Uint8Array):number {
	const hmmm = hex.decode(hex.encode(buf)) // needed to make work ?
	const view = new DataView(hmmm.buffer);
	const amt = view.getUint32(0);
	return amt;
}
 */
export function amountToBigUint64(amt: number, size: number) {
  //P..U64BE(BigInt(amt))
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(amt)); // Max unsigned 32-bit integer
  const res = new BigUint64Array(view.buffer);
  return hex.decode(bufferToHex(res.buffer));
  //(amt.toString(16).padStart(16, "0"))
}
function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function bigUint64ToAmount(buf: Uint8Array): number {
  // rencode in case it was passed in a string encoded.
  if (!buf || buf.byteLength === 0) return 0;
  buf = hex.decode(hex.encode(buf));
  const view = new DataView(buf.buffer, 0, 8);
  const amt = view.getBigUint64(0);
  return Number(amt);
}

export enum PrincipalType {
  STANDARD = "05",
  CONTRACT = "06",
}

export function readDepositValue(outputs: Array<any>) {
  let amountSats = 0;
  if (outputs[0].scriptPubKey.type.toLowerCase() === "nulldata") {
    amountSats = bitcoinToSats(outputs[1].value);
  } else {
    amountSats = bitcoinToSats(outputs[0].value);
  }
  return amountSats;
}

export function parseSbtcPayloadFromOutput(
  network: string,
  tx: btc.Transaction
): SbtcPayloadDetails {
  //const out0 = tx.getOutput(0)
  //let d1 = out0.script?.subarray(5) as Uint8Array // strip the op type and data length
  const vout1Address = getAddressFromOutScript(
    network,
    tx.getOutput(1).script || new Uint8Array()
  );
  let payload = parseRawSbtcPayload(
    network,
    hex.encode(tx.getOutput(0).script || new Uint8Array()),
    vout1Address,
    "vrs"
  );
  return payload;
}

/**
 *
 * @param network
 * @param amount
 * @param bitcoinAddress
 * @returns
 */
export function getDataToSign(
  network: string,
  amount: number,
  bitcoinAddress: string
): string {
  const net = getNet(network);
  const tx = new btc.Transaction({
    allowUnknowOutput: true,
    allowUnknownInputs: true,
    allowUnknownOutputs: true,
  });
  tx.addOutputAddress(bitcoinAddress, BigInt(amount), net);
  const amountBytes = P.U64BE.encode(BigInt(amount));
  const data = concatBytes(amountBytes, tx.getOutput(0).script!);
  return `Withdraw request for ${amount} satoshis to the bitcoin address ${bitcoinAddress} (${hex.encode(
    data
  )})`;
}

function hash160(input: Uint8Array): Uint8Array {
  const sha = sha256(input);
  return ripemd160(sha);
}
