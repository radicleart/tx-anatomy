"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrincipalType = void 0;
exports.parseRawSbtcPayload = parseRawSbtcPayload;
exports.parseSbtcWithdrawPayload = parseSbtcWithdrawPayload;
exports.getStacksSimpleHashOfDataToSign = getStacksSimpleHashOfDataToSign;
exports.getStacksAddressFromSignature = getStacksAddressFromSignature;
exports.getStacksAddressFromSignatureRsv = getStacksAddressFromSignatureRsv;
exports.getStacksAddressFromPubkey = getStacksAddressFromPubkey;
exports.parseSbtcDepositPayload = parseSbtcDepositPayload;
exports.amountToUint8 = amountToUint8;
exports.amountToBigUint64 = amountToBigUint64;
exports.bigUint64ToAmount = bigUint64ToAmount;
exports.readDepositValue = readDepositValue;
exports.parseSbtcPayloadFromOutput = parseSbtcPayloadFromOutput;
exports.getDataToSign = getDataToSign;
const btc = __importStar(require("@scure/btc-signer"));
const base_1 = require("@scure/base");
const c32check_1 = require("c32check");
const sha256_1 = require("@noble/hashes/sha256");
const ripemd160_1 = require("@noble/hashes/ripemd160");
const P = __importStar(require("micro-packed"));
const common_1 = require("@stacks/common");
const encryption_1 = require("@stacks/encryption");
const transactions_1 = require("@stacks/transactions");
const bitcoin_utils_1 = require("./bitcoin_utils");
const bitcoin_parsing_1 = require("./bitcoin_parsing");
function parseRawSbtcPayload(network, d0, vout1Address, sigMode) {
    let d1 = base_1.hex.decode(d0).subarray(4);
    let magicOp = (0, bitcoin_parsing_1.getMagicAndOpCode)(d1);
    if (magicOp.opcode !== "3C" && magicOp.opcode !== "3E") {
        d1 = base_1.hex.decode(d0).subarray(5);
        magicOp = (0, bitcoin_parsing_1.getMagicAndOpCode)(d1);
    }
    if (magicOp.opcode === "3C") {
        const payload = parseSbtcDepositPayload(d1);
        return payload;
    }
    else if (magicOp.opcode === "3E") {
        try {
            if (vout1Address)
                return parseSbtcWithdrawPayload(network, base_1.hex.encode(d1), vout1Address, sigMode);
            else
                throw new Error("Withdrawal requires the address from output 1: " + magicOp.opcode);
        }
        catch (err) {
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
    }
    else {
        throw new Error("Wrong opcode: " + magicOp.opcode);
    }
}
function parseSbtcWithdrawPayload(network, d0, bitcoinAddress, sigMode) {
    const d1 = base_1.hex.decode(d0);
    const magicOp = (0, bitcoin_parsing_1.getMagicAndOpCode)(d1);
    if (magicOp.magic) {
        return parseWithdrawalPayloadNoMagic(network, d1.subarray(2), bitcoinAddress, sigMode);
    }
    return parseWithdrawalPayloadNoMagic(network, d1, bitcoinAddress, sigMode);
}
function parseWithdrawalPayloadNoMagic(network, d1, bitcoinAddress, sigMode) {
    const opcode = base_1.hex.encode(d1.subarray(0, 1)).toUpperCase();
    if (opcode !== "3E")
        throw new Error("Wrong opcode for withdraw: should be 3E was " + opcode);
    const amtB = d1.subarray(1, 9);
    const amountSats = bigUint64ToAmount(amtB);
    let signature = base_1.hex.encode(d1.subarray(9, 74));
    const msgHash = getStacksSimpleHashOfDataToSign(network, amountSats, bitcoinAddress);
    let stacksAddress;
    try {
        const pubKey = getPubkeySignature(base_1.hex.decode(msgHash), signature, sigMode);
        console.log("parseWithdrawalPayloadNoMagic:pubKey: " + base_1.hex.encode(pubKey));
        const stxAddresses = getStacksAddressFromPubkey(pubKey);
        stacksAddress =
            network === network ? stxAddresses.tp2pkh : stxAddresses.mp2pkh;
    }
    catch (err) {
        //
    }
    return {
        magic: {},
        opcode,
        stacksAddress,
        signature,
        amountSats,
    };
}
function getStacksSimpleHashOfDataToSign(network, amount, bitcoinAddress) {
    const dataToSign = getDataToSign(network, amount, bitcoinAddress);
    const msgHash = (0, encryption_1.hashMessage)(dataToSign);
    return base_1.hex.encode(msgHash);
}
function getPubkeySignature(messageHash, signature, sigMode) {
    let pubkey = (0, transactions_1.publicKeyFromSignatureVrs)(base_1.hex.encode(messageHash), signature, transactions_1.PubKeyEncoding.Compressed);
    if (sigMode === "rsv") {
        pubkey = (0, transactions_1.publicKeyFromSignatureRsv)(base_1.hex.encode(messageHash), signature, transactions_1.PubKeyEncoding.Compressed);
    }
    return base_1.hex.decode(pubkey);
}
/**
 *
 * @param messageHash
 * @param signature
 * @returns
 */
function getStacksAddressFromSignature(messageHash, signature) {
    const pubkey = getPubkeySignature(messageHash, signature, "vrs");
    return getStacksAddressFromPubkey(pubkey);
}
function getStacksAddressFromSignatureRsv(messageHash, signature) {
    const pubkey = getPubkeySignature(messageHash, signature, "rsv");
    return getStacksAddressFromPubkey(pubkey);
}
function getStacksAddressFromPubkey(pubkey) {
    const addresses = {
        tp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2PKH),
        tp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.testnetP2SH),
        mp2pkh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2PKH),
        mp2sh: publicKeyToStxAddress(pubkey, StacksNetworkVersion.mainnetP2SH),
    };
    //console.log('getStacksAddressFromPubkey: addresses: ', addresses)
    return addresses;
}
function publicKeyToStxAddress(publicKey, addressVersion = StacksNetworkVersion.mainnetP2PKH) {
    return (0, c32check_1.c32address)(addressVersion, base_1.hex.encode(hash160(publicKey)));
}
var StacksNetworkVersion;
(function (StacksNetworkVersion) {
    StacksNetworkVersion[StacksNetworkVersion["mainnetP2PKH"] = 22] = "mainnetP2PKH";
    StacksNetworkVersion[StacksNetworkVersion["mainnetP2SH"] = 20] = "mainnetP2SH";
    StacksNetworkVersion[StacksNetworkVersion["testnetP2PKH"] = 26] = "testnetP2PKH";
    StacksNetworkVersion[StacksNetworkVersion["testnetP2SH"] = 21] = "testnetP2SH";
})(StacksNetworkVersion || (StacksNetworkVersion = {}));
function parseSbtcDepositPayload(d1) {
    const magicOp = (0, bitcoin_parsing_1.getMagicAndOpCode)(d1);
    if (magicOp.magic) {
        return parseDepositPayloadNoMagic(d1.subarray(2));
    }
    return parseDepositPayloadNoMagic(d1);
}
function parseDepositPayloadNoPrincipal(d1) {
    const opcode = base_1.hex.encode(d1.subarray(0, 1)).toUpperCase();
    const addr0 = parseInt(base_1.hex.encode(d1.subarray(1, 2)), 16);
    const addr1 = base_1.hex.encode(d1.subarray(2, 22));
    const stacksAddress = (0, c32check_1.c32address)(addr0, addr1);
    return {
        magic: {},
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
function parseDepositPayloadNoMagic(d1) {
    //console.log('payload rev: ', hex.encode(d1))
    const opcode = base_1.hex.encode(d1.subarray(0, 1)).toUpperCase();
    if (opcode.toUpperCase() !== bitcoin_parsing_1.PEGIN_OPCODE)
        throw new Error("Wrong OPCODE : expected: " + bitcoin_parsing_1.PEGIN_OPCODE + "  received: " + opcode);
    const prinType = parseInt(base_1.hex.encode(d1.subarray(1, 2)), 16);
    if (prinType === 22 || prinType === 26)
        return parseDepositPayloadNoPrincipal(d1);
    const addr0 = parseInt(base_1.hex.encode(d1.subarray(2, 3)), 16);
    const addr1 = base_1.hex.encode(d1.subarray(3, 23));
    const stacksAddress = (0, c32check_1.c32address)(addr0, addr1);
    const lengthOfCname = parseInt(base_1.hex.encode(d1.subarray(23, 24)), 8);
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
        console.log("parseDepositPayloadNoMagic: " + base_1.hex.encode(rev));
        revealFee = bigUint64ToAmount(rev);
        console.log("parseDepositPayloadNoMagic:revealFee: " + revealFee);
    }
    return {
        magic: {},
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
function amountToUint8(amt, size) {
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
function amountToBigUint64(amt, size) {
    //P..U64BE(BigInt(amt))
    const buffer = new ArrayBuffer(size);
    const view = new DataView(buffer);
    view.setBigUint64(0, BigInt(amt)); // Max unsigned 32-bit integer
    const res = new BigUint64Array(view.buffer);
    return base_1.hex.decode(bufferToHex(res.buffer));
    //(amt.toString(16).padStart(16, "0"))
}
function bufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
function bigUint64ToAmount(buf) {
    // rencode in case it was passed in a string encoded.
    if (!buf || buf.byteLength === 0)
        return 0;
    buf = base_1.hex.decode(base_1.hex.encode(buf));
    const view = new DataView(buf.buffer, 0, 8);
    const amt = view.getBigUint64(0);
    return Number(amt);
}
var PrincipalType;
(function (PrincipalType) {
    PrincipalType["STANDARD"] = "05";
    PrincipalType["CONTRACT"] = "06";
})(PrincipalType || (exports.PrincipalType = PrincipalType = {}));
function readDepositValue(outputs) {
    let amountSats = 0;
    if (outputs[0].scriptPubKey.type.toLowerCase() === "nulldata") {
        amountSats = (0, bitcoin_utils_1.bitcoinToSats)(outputs[1].value);
    }
    else {
        amountSats = (0, bitcoin_utils_1.bitcoinToSats)(outputs[0].value);
    }
    return amountSats;
}
function parseSbtcPayloadFromOutput(network, tx) {
    //const out0 = tx.getOutput(0)
    //let d1 = out0.script?.subarray(5) as Uint8Array // strip the op type and data length
    const vout1Address = (0, bitcoin_utils_1.getAddressFromOutScript)(network, tx.getOutput(1).script || new Uint8Array());
    let payload = parseRawSbtcPayload(network, base_1.hex.encode(tx.getOutput(0).script || new Uint8Array()), vout1Address, "vrs");
    return payload;
}
/**
 *
 * @param network
 * @param amount
 * @param bitcoinAddress
 * @returns
 */
function getDataToSign(network, amount, bitcoinAddress) {
    const net = (0, bitcoin_utils_1.getNet)(network);
    const tx = new btc.Transaction({
        allowUnknowOutput: true,
        allowUnknownInputs: true,
        allowUnknownOutputs: true,
    });
    tx.addOutputAddress(bitcoinAddress, BigInt(amount), net);
    const amountBytes = P.U64BE.encode(BigInt(amount));
    const data = (0, common_1.concatBytes)(amountBytes, tx.getOutput(0).script);
    return `Withdraw request for ${amount} satoshis to the bitcoin address ${bitcoinAddress} (${base_1.hex.encode(data)})`;
}
function hash160(input) {
    const sha = (0, sha256_1.sha256)(input);
    return (0, ripemd160_1.ripemd160)(sha);
}
