import * as btc from "@scure/btc-signer";
import { hex } from "@scure/base";
import {
  InscriptionPayloadType,
  MagicCode,
  PayloadType,
  SbtcPayloadDetails,
  SbtcPayloadType,
  TransactionOutput,
} from "./bitcoin_types";
import { parseRawSbtcPayload } from "./bitcoin_sbtc";
import { getAddressFromOutScript } from "./bitcoin_utils";
import { Inscription, parseInscriptions } from "micro-ordinals";
import { ScriptType, OptScript, CustomScript } from "@scure/btc-signer";

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
export const MAGIC_BYTES_TESTNET = "5432";
export const MAGIC_BYTES_TESTNET_NAK = "4e33";
export const MAGIC_BYTES_MAINNET = "5832";
export const MAGIC_BYTES_MAINNET_NAK = "5832";
export const PEGIN_OPCODE = "3C";
export const PEGOUT_OPCODE = "3E";

export function parseRawTransaction(
  network: string,
  txHex: string
): Array<TransactionOutput> {
  const outputs: Array<TransactionOutput> = [];
  const transaction: btc.Transaction = btc.Transaction.fromRaw(
    hex.decode(txHex),
    {
      allowUnknowInput: true,
      allowUnknowOutput: true,
      allowUnknownOutputs: true,
      allowUnknownInputs: true,
    }
  );
  for (let index = 0; index < transaction.outputsLength; index++) {
    const output = transaction.getOutput(index);
    const scriptPubKey = hex.encode(output.script!);
    // const keyScript1 = btc.Script.decode(hex.decode(scriptPubKey));
    // const keys = btc.OutScript.decode(hex.decode(scriptPubKey));

    let transactionOutput: TransactionOutput = parseOutput(
      network,
      scriptPubKey
    );
    transactionOutput.amount = output.amount;
    outputs.push(transactionOutput);

    console.log(`Output #${index}`);
    console.log(`  Value: ${output.amount} satoshis`);
    console.log(`  ScriptPubKey: ${scriptPubKey}`);

    // Inspect for specific rune patterns (this example assumes a "rune" tag or opcode)
    if (scriptPubKey.includes("rune")) {
      console.log(`  Found a rune in output #${index}`);
    } else {
      console.log(`  No rune found in output #${index}`);
    }
  }
  return outputs;
}

export function parseOutput(
  network: string,
  script: string
): TransactionOutput {
  const outputScript = btc.OutScript.decode(
    hex.decode(script) || new Uint8Array()
  );
  const scriptScript = btc.Script.decode(
    hex.decode(script) || new Uint8Array()
  );
  const address = getAddressFromOutScript(
    network,
    hex.decode(script) || new Uint8Array()
  );
  if (outputScript.type === "unknown") {
    let d1 = hex.decode(script).subarray(4);
    let magic: MagicCode = getMagicAndOpCode(d1);
    let protocol = "transfer";
    let payload:
      | string
      | PayloadType
      | SbtcPayloadType
      | InscriptionPayloadType = {} as PayloadType;
    try {
      const sbtcDetails: SbtcPayloadDetails = parseRawSbtcPayload(
        network,
        script,
        undefined,
        "rsv"
      );
      protocol = "sbtc";
      payload = {
        magic,
        data: sbtcDetails,
      };
    } catch (err: any) {
      try {
        const inscriptions = parseInscriptions(scriptScript, true);
        protocol = "ordinals";
        payload = {
          magic,
          data: inscriptions,
        };
      } catch (err: any) {}
      protocol = "undetermined";
    }
    return { type: outputScript.type, data: payload, protocol };
  } else {
    return { type: outputScript.type, data: address, protocol: "transfer" };
  }
}

export function getMagicAndOpCode(d1: Uint8Array): MagicCode {
  if (!d1 || d1.length < 2) throw new Error("no magic data passed");
  const magic = hex.encode(d1.subarray(0, 2));
  if (magic === MAGIC_BYTES_TESTNET || magic === MAGIC_BYTES_MAINNET) {
    return {
      magic: magic.toUpperCase(),
      opcode: hex.encode(d1.subarray(2, 3)).toUpperCase(),
    };
  }
  return {
    opcode: hex.encode(d1.subarray(0, 1)).toUpperCase(),
  };
}
