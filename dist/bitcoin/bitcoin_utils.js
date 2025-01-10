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
exports.REGTEST_NETWORK = void 0;
exports.getNet = getNet;
exports.bitcoinToSats = bitcoinToSats;
exports.fromStorable = fromStorable;
exports.toStorable = toStorable;
exports.getAddressFromOutScript = getAddressFromOutScript;
const btc = __importStar(require("@scure/btc-signer"));
const base_1 = require("@scure/base");
const btcPrecision = 100000000;
function getNet(network) {
    let net = btc.TEST_NETWORK;
    if (network === "devnet")
        net = exports.REGTEST_NETWORK;
    else if (network === "mainnet")
        net = btc.NETWORK;
    return net;
}
exports.REGTEST_NETWORK = {
    bech32: "bcrt",
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xc4,
};
function bitcoinToSats(amountBtc) {
    return Math.round(amountBtc * btcPrecision);
}
/**
 * Ensure we don't overwrite the original object with Uint8Arrays these can't be serialised to local storage.
 * @param script
 * @returns
 */
function fromStorable(script) {
    const clone = JSON.parse(JSON.stringify(script));
    if (typeof script.tweakedPubkey !== "string")
        return clone;
    return codifyScript(clone, true);
}
/**
 *
 * @param script
 * @returns
 */
function toStorable(script) {
    //const copied = JSON.parse(JSON.stringify(script));
    return codifyScript(script, false);
}
function codifyScript(script, asString) {
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
function codifyTapLeafScript(tapLeafScript, asString) {
    if (tapLeafScript[0]) {
        const level0 = tapLeafScript[0];
        if (level0[0])
            tapLeafScript[0][0].internalKey = codify(tapLeafScript[0][0].internalKey, asString);
        if (level0[0])
            tapLeafScript[0][0].merklePath[0] = codify(tapLeafScript[0][0].merklePath[0], asString);
        if (level0[1])
            tapLeafScript[0][1] = codify(tapLeafScript[0][1], asString);
    }
    if (tapLeafScript[1]) {
        const level1 = tapLeafScript[1];
        if (level1[0])
            tapLeafScript[1][0].internalKey = codify(tapLeafScript[1][0].internalKey, asString);
        if (level1[0])
            tapLeafScript[1][0].merklePath[0] = codify(tapLeafScript[1][0].merklePath[0], asString);
        if (level1[1])
            tapLeafScript[1][1] = codify(tapLeafScript[1][1], asString);
    }
    return tapLeafScript;
}
function codify(arg, asString) {
    if (!arg)
        return;
    if (typeof arg === "string") {
        return base_1.hex.decode(arg);
    }
    else {
        return base_1.hex.encode(arg);
    }
}
function codifyLeaves(leaves, asString) {
    if (leaves[0]) {
        const level1 = leaves[0];
        if (level1.controlBlock)
            leaves[0].controlBlock = codify(leaves[0].controlBlock, asString);
        if (level1.hash)
            leaves[0].hash = codify(leaves[0].hash, asString);
        if (level1.script)
            leaves[0].script = codify(leaves[0].script, asString);
        if (level1.path && level1.path[0])
            leaves[0].path[0] = codify(leaves[0].path[0], asString);
    }
    if (leaves[1]) {
        const level1 = leaves[1];
        if (level1.controlBlock)
            leaves[1].controlBlock = codify(leaves[1].controlBlock, asString);
        if (level1.hash)
            leaves[1].hash = codify(leaves[1].hash, asString);
        if (level1.script)
            leaves[1].script = codify(leaves[1].script, asString);
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
function getAddressFromOutScript(network, script) {
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
        return `${outputScript.type}::${base_1.hex.encode(script)}`;
    }
    return btc.Address(net).encode({
        type: outputScript.type,
        hash: outputScript.hash,
    });
}
