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
exports.PEGOUT_OPCODE = exports.PEGIN_OPCODE = exports.MAGIC_BYTES_MAINNET_NAK = exports.MAGIC_BYTES_MAINNET = exports.MAGIC_BYTES_TESTNET_NAK = exports.MAGIC_BYTES_TESTNET = void 0;
exports.parseRawTransaction = parseRawTransaction;
exports.parseOutput = parseOutput;
exports.getMagicAndOpCode = getMagicAndOpCode;
const btc = __importStar(require("@scure/btc-signer"));
const base_1 = require("@scure/base");
const bitcoin_sbtc_1 = require("./bitcoin_sbtc");
const bitcoin_utils_1 = require("./bitcoin_utils");
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
exports.MAGIC_BYTES_TESTNET = "5432";
exports.MAGIC_BYTES_TESTNET_NAK = "4e33";
exports.MAGIC_BYTES_MAINNET = "5832";
exports.MAGIC_BYTES_MAINNET_NAK = "5832";
exports.PEGIN_OPCODE = "3C";
exports.PEGOUT_OPCODE = "3E";
function parseRawTransaction(network, txHex) {
    const outputs = [];
    const transaction = btc.Transaction.fromRaw(base_1.hex.decode(txHex), {
        allowUnknowInput: true,
        allowUnknowOutput: true,
        allowUnknownOutputs: true,
        allowUnknownInputs: true,
    });
    for (let index = 0; index < transaction.outputsLength; index++) {
        const output = transaction.getOutput(index);
        const scriptPubKey = base_1.hex.encode(output.script);
        // const keyScript1 = btc.Script.decode(hex.decode(scriptPubKey));
        // const keys = btc.OutScript.decode(hex.decode(scriptPubKey));
        let transactionOutput = parseOutput(network, scriptPubKey);
        transactionOutput.amount = output.amount;
        outputs.push(transactionOutput);
        console.log(`Output #${index}`);
        console.log(`  Value: ${output.amount} satoshis`);
        console.log(`  ScriptPubKey: ${scriptPubKey}`);
        // Inspect for specific rune patterns (this example assumes a "rune" tag or opcode)
        if (scriptPubKey.includes("rune")) {
            console.log(`  Found a rune in output #${index}`);
        }
        else {
            console.log(`  No rune found in output #${index}`);
        }
    }
    return outputs;
}
function parseOutput(network, script) {
    const outputScript = btc.OutScript.decode(base_1.hex.decode(script) || new Uint8Array());
    const address = (0, bitcoin_utils_1.getAddressFromOutScript)(network, base_1.hex.decode(script) || new Uint8Array());
    if (outputScript.type === "unknown") {
        let protocol = "transfer";
        let payload = {};
        try {
            payload = (0, bitcoin_sbtc_1.parseRawSbtcPayload)(network, script, undefined, "rsv");
            protocol = "sbtc";
        }
        catch (err) {
            protocol = "undetermined";
        }
        let d1 = base_1.hex.decode(script).subarray(4);
        let magicOp = getMagicAndOpCode(d1);
        payload.magic = magicOp;
        return { type: outputScript.type, data: payload, protocol };
    }
    else {
        return { type: outputScript.type, data: address, protocol: "transfer" };
    }
}
function getMagicAndOpCode(d1) {
    if (!d1 || d1.length < 2)
        throw new Error("no magic data passed");
    const magic = base_1.hex.encode(d1.subarray(0, 2));
    if (magic === exports.MAGIC_BYTES_TESTNET || magic === exports.MAGIC_BYTES_MAINNET) {
        return {
            magic: magic.toUpperCase(),
            opcode: base_1.hex.encode(d1.subarray(2, 3)).toUpperCase(),
        };
    }
    return {
        opcode: base_1.hex.encode(d1.subarray(0, 1)).toUpperCase(),
    };
}
