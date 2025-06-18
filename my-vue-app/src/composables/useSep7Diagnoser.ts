import { ref, reactive } from 'vue';
import { isValidStellarPublicKey, isValidAssetCode, isValidAmount } from '../utils/validators';
import { Transaction, Networks, StrKey, xdr as StellarXDR } from 'stellar-sdk';

// --- Data Structures for the Diagnosis Report ---

export interface DiagnosticError {
  message: string;
  // TODO: code?: string; // For specific error types
}

export interface SyntaxAnalysis {
  isValid: boolean;
  scheme: string | null;
  operation: string | null;
  rawParams: Record<string, string>; // All raw query params
  errors: DiagnosticError[];
}

export enum ParameterStatus {
  Valid = '✅',
  Invalid = '❌',
  Warning = '⚠️',
  Info = 'ℹ️', // For parameters that are just informational
  NotApplicable = 'N/A',
}

export interface ParameterDetail {
  name: string;
  value: string; // Raw value
  status: ParameterStatus;
  message?: string; // For errors or warnings
  // TODO: Add specific parsed data for complex params like xdr, replace
  parsedValue?: any; // Will hold structured data for XDR, replace etc.
}

export interface ParametersAnalysis {
  // Individual parameter checks
  details: ParameterDetail[];
  // TODO: Cross-parameter validation results
  // crossValidationErrors: DiagnosticError[];
}

export interface SecurityAnalysis {
  // Example fields, to be expanded
  originDomain?: {
    value: string | null;
    isValid: boolean;
    message?: string;
  };
  signature?: {
    value: string | null;
    isValid: boolean; // This will require crypto libraries
    message?: string;
  };
  // TODO: Other security aspects if any
  summary: ParameterStatus; // Overall security summary
  messages: DiagnosticError[];
}

// Placeholder for XDR details (FR3)
export interface XdrDetailsData {
  raw: string;
  summary?: object; // Human-readable (FR3.2)
  txrep?: string;   // (FR3.3)
  json?: string;    // JSON representation (FR3.4)
  base64?: string;  // Base64 (already have raw, but maybe different forms) (FR3.5)
  // TODO: Add validation status for the XDR itself
}

// Placeholder for Replace instruction details (FR4)
export interface ReplaceInstructionData {
  raw: string;
  // TODO: Structured representation of fields and hints (FR4.1)
  fields: Array<{ field: string; value: string; hint?: string }>;
  isValid: boolean;
  errors: DiagnosticError[];
}

// Main Diagnosis Report Data Structure
export interface DiagnosisReportData {
  uri: string;
  timestamp: Date;
  syntax: SyntaxAnalysis;
  parameters: ParametersAnalysis | null; // Null if basic syntax fails
  security: SecurityAnalysis | null;   // Null if basic syntax fails or not applicable
  xdrDetails?: XdrDetailsData | null;   // If 'tx' operation with XDR
  replaceDetails?: ReplaceInstructionData | null; // If 'replace' parameter is present
}

// --- The Composable ---

export function useSep7Diagnoser() {
  const diagnosisResult = ref<DiagnosisReportData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const diagnoseSep7Uri = async (uri: string): Promise<void> => {
    isLoading.value = true;
    error.value = null;
    diagnosisResult.value = null;

    try {
      const report: Partial<DiagnosisReportData> = {
        uri: uri,
        timestamp: new Date(),
      };

      // FR2.2: Анализ синтаксиса URI (схема, операция)
      report.syntax = performSyntaxAnalysis(uri);

      if (!report.syntax.isValid) {
        // If basic syntax is invalid, we might stop here or limit further analysis
        diagnosisResult.value = report as DiagnosisReportData;
        isLoading.value = false;
        return;
      }

      // FR2.3: Детальный анализ каждого параметра URI
      // FR2.4: Отображение статуса валидности для каждого параметра
      // FR2.5: Отображение ясных сообщений об ошибках.
      report.parameters = performParametersAnalysis(report.syntax.rawParams, report.syntax.operation);

      // FR2.6: Агрегированный анализ безопасности
      report.security = performSecurityAnalysis(report.syntax.rawParams, report.syntax.operation);

      // FR3: Детальное представление транзакции (xdr)
      const xdrParam = report.parameters.details.find(p => p.name === 'xdr' && p.status === ParameterStatus.Valid);
      if (report.syntax.operation === 'tx' && xdrParam) {
        report.xdrDetails = processXdr(xdrParam.value, report.syntax.rawParams['network_passphrase']);
      }

      // FR4: Детальное представление инструкции (replace)
      const replaceParam = report.parameters.details.find(p => p.name === 'replace' && p.status === ParameterStatus.Valid);
      if (replaceParam) {
        report.replaceDetails = processReplaceInstructions(replaceParam.value);
      }

      diagnosisResult.value = report as DiagnosisReportData;

    } catch (e: any) {
      error.value = e.message || 'An unknown error occurred during diagnosis.';
      console.error('Diagnosis error:', e);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    diagnosisResult,
    isLoading,
    error,
    diagnoseSep7Uri,
  };
}

// --- Helper Functions (Moved to top-level for export) ---

export function performSyntaxAnalysis(uri: string): SyntaxAnalysis {
    const result: SyntaxAnalysis = {
      isValid: false,
      scheme: null,
      operation: null,
      rawParams: {},
      errors: [],
    };

    if (!uri || uri.trim() === "") {
        result.errors.push({ message: "URI cannot be empty." });
        result.isValid = false;
        return result;
    }

    try {
      const url = new URL(uri);
      result.scheme = url.protocol.replace(/:$/, ''); // Remove trailing ':'

      if (result.scheme !== 'web+stellar') {
        result.errors.push({ message: `Invalid URI scheme: Expected 'web+stellar:', got '${result.scheme}'.` });
      } else {
        let operationPath = url.pathname;
        // Normalize pathname: remove leading slashes, handle potential host part if used like web+stellar://host/op
        // For web+stellar:op?query, pathname is 'op'
        // For web+stellar:/op?query, pathname is '/op'
        // For web+stellar://host/op?query, pathname is '/op' and host is 'host'
        if (url.host && operationPath.startsWith('/')) { // e.g. web+stellar://stellar.org/tx -> pathname is /tx
            operationPath = operationPath.substring(1);
        } else if (operationPath.startsWith('/')) { //e.g. web+stellar:/tx -> pathname is /tx
             operationPath = operationPath.substring(1);
        }
        // also handle cases like web+stellar:tx where pathname might be "tx" directly

        // Always set the operation, even if it's an empty string (e.g. web+stellar:?foo=bar)
        // The validity of the operation is checked below.
        result.operation = operationPath;

        if (operationPath) {
            // SEP-7 Standard operations
            const validOperations = ['tx', 'pay', 'sign', 'trust', 'add_network', 'remove_network'];
            if (!validOperations.includes(result.operation)) { // result.operation will be operationPath here
                 result.errors.push({ message: `Unsupported or invalid operation: '${result.operation}'.` });
            }
        } else { // operationPath is empty or null (result.operation was already set to it)
            result.errors.push({ message: 'Missing operation (e.g., tx, pay) in URI path.' });
        }
      }

      url.searchParams.forEach((value, key) => {
        result.rawParams[key] = value;
      });

      result.isValid = result.errors.length === 0;

    } catch (e: any) {
      result.errors.push({ message: `URI parsing failed: ${e.message}. Please ensure it is a valid URI.` });
      result.isValid = false;
    }
    return result;
}

export function performParametersAnalysis(params: Record<string, string>, operation: string | null): ParametersAnalysis {
    const details: ParameterDetail[] = [];
    const knownParams = new Set(Object.keys(params));

    // Example: Validate 'xdr' for 'tx' operation
    if (operation === 'tx') {
        if (params['xdr']) {
            details.push({ name: 'xdr', value: params['xdr'], status: ParameterStatus.Info, message: 'XDR presence noted. Full validation pending.' });
            knownParams.delete('xdr');
        } else {
            details.push({ name: 'xdr', value: '', status: ParameterStatus.Invalid, message: "'xdr' parameter is required for 'tx' operation." });
            knownParams.delete('xdr'); // ensure it's handled
        }
    }

    // Example: Validate 'destination', 'amount' for 'pay' operation
    if (operation === 'pay') {
        if (params['destination']) {
            const isValidDest = isValidStellarPublicKey(params['destination']);
            details.push({ name: 'destination', value: params['destination'], status: isValidDest ? ParameterStatus.Valid : ParameterStatus.Invalid, message: isValidDest ? 'Valid Stellar Public Key.' : 'Invalid Stellar Public Key format.' });
            knownParams.delete('destination');
        } else {
            details.push({ name: 'destination', value: '', status: ParameterStatus.Invalid, message: "'destination' is required for 'pay' operation." });
            knownParams.delete('destination');
        }
        if (params['amount']) {
            const isValidNum = isValidAmount(params['amount']);
            details.push({ name: 'amount', value: params['amount'], status: isValidNum ? ParameterStatus.Valid : ParameterStatus.Invalid, message: isValidNum ? 'Valid amount.' : 'Amount must be a positive number.' });
            knownParams.delete('amount');
        } else {
            details.push({ name: 'amount', value: '', status: ParameterStatus.Invalid, message: "'amount' is required for 'pay' operation." });
            knownParams.delete('amount');
        }
        // Asset code/issuer (simplified)
        if (params['asset_code']) {
            const isValidCode = isValidAssetCode(params['asset_code']);
            details.push({ name: 'asset_code', value: params['asset_code'], status: isValidCode ? ParameterStatus.Valid : ParameterStatus.Invalid, message: isValidCode ? 'Valid asset code.' : 'Invalid asset code format.'});
            knownParams.delete('asset_code');
            if (params['asset_issuer']) {
                const isValidIssuer = isValidStellarPublicKey(params['asset_issuer']);
                details.push({ name: 'asset_issuer', value: params['asset_issuer'], status: isValidIssuer ? ParameterStatus.Valid : ParameterStatus.Invalid, message: isValidIssuer ? 'Valid asset issuer.' : 'Invalid asset issuer format.' });
                knownParams.delete('asset_issuer');
            } else if (params['asset_code'] !== 'XLM') {
                 details.push({ name: 'asset_issuer', value: '', status: ParameterStatus.Invalid, message: "'asset_issuer' is required if 'asset_code' is not XLM." });
                 knownParams.delete('asset_issuer');
            }
        } else if (params['asset_issuer']) { // Issuer without code
             details.push({ name: 'asset_code', value: '', status: ParameterStatus.Invalid, message: "'asset_code' is required if 'asset_issuer' is present." });
             knownParams.delete('asset_code');
        }
    }

    // Common params like 'callback', 'pubkey', 'origin_domain', 'signature', 'network_passphrase'
    if (params['callback']) {
        try {
            new URL(params['callback']);
            details.push({ name: 'callback', value: params['callback'], status: ParameterStatus.Valid, message: 'Valid URL format.' });
        } catch (e) {
            details.push({ name: 'callback', value: params['callback'], status: ParameterStatus.Invalid, message: 'Invalid URL format for callback.' });
        }
        knownParams.delete('callback');
    }
    if (params['pubkey']) {
        const isValidKey = isValidStellarPublicKey(params['pubkey']);
        details.push({ name: 'pubkey', value: params['pubkey'], status: isValidKey ? ParameterStatus.Valid : ParameterStatus.Invalid, message: isValidKey ? 'Valid Stellar Public Key.' : 'Invalid Stellar Public Key format for pubkey.' });
        knownParams.delete('pubkey');
    }
    if (params['network_passphrase']) {
        details.push({ name: 'network_passphrase', value: params['network_passphrase'], status: ParameterStatus.Info, message: 'Network passphrase noted. Ensure it matches the target network.' });
        knownParams.delete('network_passphrase');
    }
    // origin_domain and signature are handled more in security analysis but can be listed here
    if (params['origin_domain']) {
        details.push({ name: 'origin_domain', value: params['origin_domain'], status: ParameterStatus.Info, message: 'Noted. See Security Analysis for details.' });
        knownParams.delete('origin_domain');
    }
    if (params['signature']) {
        details.push({ name: 'signature', value: params['signature'], status: ParameterStatus.Info, message: 'Noted. See Security Analysis for details.' });
        knownParams.delete('signature');
    }
    if (params['replace']) {
        details.push({ name: 'replace', value: params['replace'], status: ParameterStatus.Info, message: 'Noted. See Replace Details section.' });
        knownParams.delete('replace');
    }

    // Add any remaining (unknown or not yet specifically handled) parameters
    knownParams.forEach(name => {
        details.push({ name, value: params[name], status: ParameterStatus.Warning, message: 'Unrecognized or non-standard parameter for this operation.' });
    });

    return { details };
}

export function performSecurityAnalysis(params: Record<string, string>, operation: string | null): SecurityAnalysis {
    const analysis: SecurityAnalysis = {
        summary: ParameterStatus.Info, // Default: Assume neutral until checks pass/fail
        messages: [],
        originDomain: { value: params['origin_domain'] || null, isValid: false },
        signature: { value: params['signature'] || null, isValid: false }
    };

    const originDomain = params['origin_domain'];
    if (originDomain) {
        // Basic validation: should be a plausible domain name.
        // For a real check, one might try to resolve it or check against a known list for phishing.
        // Here, we'll just check if it "looks" like a domain.
        if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(originDomain)) {
            analysis.originDomain = { value: originDomain, isValid: true, message: 'Origin domain format appears valid.' };
        } else {
            analysis.originDomain = { value: originDomain, isValid: false, message: 'Origin domain format appears invalid.' };
            analysis.messages.push({ message: `Invalid format for origin_domain: ${originDomain}` });
        }
    } else {
        analysis.messages.push({ message: 'CRITICAL: origin_domain parameter is MISSING. This is a major security requirement for SEP-7.' });
        analysis.summary = ParameterStatus.Invalid; // Missing origin_domain is critical
    }

    const signature = params['signature'];
    if (signature) {
        // Placeholder for actual signature validation.
        // This requires:
        // 1. The transaction XDR (if operation is 'tx').
        // 2. The origin_domain's Signer public key (fetched via stellar.toml).
        // 3. Cryptographic verification.
        analysis.signature = { value: signature, isValid: false, message: 'Signature present. Full validation requires stellar.toml lookup and cryptographic verification (not yet implemented).' };
        // For now, just acknowledge its presence and assume it's better than nothing if origin_domain is also present
        if (analysis.originDomain?.isValid) {
          // analysis.summary = ParameterStatus.Warning; // Warn because not fully validated
        }
    } else {
        if (operation === 'tx') {
            analysis.messages.push({ message: "IMPORTANT: Signature is missing for a 'tx' operation. While optional by SEP-7 spec, it is highly recommended for security." });
            if (analysis.summary !== ParameterStatus.Invalid) { analysis.summary = ParameterStatus.Warning; }
        }
    }

    // Determine overall summary
    // Start with Info, can escalate to Warning, then to Invalid.
    analysis.summary = ParameterStatus.Info; // Default if no other conditions met

    const originDomainParamProvided = !!params['origin_domain'];
    const signatureParamProvided = !!signature; // signature is params['signature']

    if (originDomainParamProvided) {
        if (analysis.originDomain?.isValid) { // Origin domain is present AND valid
            if (signatureParamProvided) { // Valid domain, signature present (but not fully validated)
                analysis.summary = ParameterStatus.Warning;
            } else if (operation === 'tx') { // Valid domain, but signature MISSING for tx
                analysis.summary = ParameterStatus.Warning;
            }
            // If valid domain, non-tx op, no signature -> stays Info (as initialized)
        } else { // Origin domain was provided but is NOT valid (malformed)
            // For malformed origin_domain, presence of signature or 'tx' op (which would ideally have a signature) is a Warning.
            if (signatureParamProvided) { // Malformed domain, but signature is there
                analysis.summary = ParameterStatus.Warning;
            } else if (operation === 'tx') { // Malformed domain, and signature missing for tx
                analysis.summary = ParameterStatus.Warning;
            }
            // Malformed domain, non-tx op, no signature -> stays Info (as initialized)
        }
    }

    // Critical override: if origin_domain was entirely missing (CRITICAL message already added).
    if (!originDomainParamProvided) {
        analysis.summary = ParameterStatus.Invalid;
    }
    // If an IMPORTANT message about missing signature for TX was added, and we are not already Invalid:
    // This condition is implicitly handled now by the logic above:
    // - if origin_domain was valid & tx & no sig -> Warning
    // - if origin_domain was malformed & tx & no sig -> Warning
    // The "IMPORTANT" message itself is added earlier.

    return analysis;
}

export function processXdr(xdrB64: string, networkPassphrase?: string): XdrDetailsData {
    const result: XdrDetailsData = {
        raw: xdrB64,
        base64: xdrB64, // Keep original base64 for FR3.5
        summary: {},
        txrep: '',
        json: '',
    };

    // The new Transaction() call will also fail if xdrB64 is not valid Base64.
    // So, the explicit atob check might be redundant and could be the source of the issue
    // if the environment's atob is behaving unexpectedly.
    // We'll rely on new Transaction() to validate both Base64 and XDR structure.

    const currentNetworkPassphrase = networkPassphrase || Networks.PUBLIC; // Default to public network if not specified

    try {
        const tx = new Transaction(xdrB64, currentNetworkPassphrase);

        // FR3.2: Человекочитаемая сводка операций.
        const operations = tx.operations.map((op: any, index: number) => {
            let details = `Operation ${index + 1}: ${op.type}`;
            // Basic details for common operations
            if (op.type === 'payment') {
                details += ` | Dest: ${op.destination} | Asset: ${op.asset.getCode() === 'native' ? 'XLM' : op.asset.getCode() + (op.asset.getIssuer() ? ':' + op.asset.getIssuer() : '')} | Amount: ${op.amount}`;
            } else if (op.type === 'createAccount') {
                details += ` | Dest: ${op.destination} | StartingBalance: ${op.startingBalance}`;
            } else if (op.type === 'pathPaymentStrictReceive' || op.type === 'pathPaymentStrictSend') {
                details += ` | Dest: ${op.destination} | SendMax: ${op.sendMax} ${op.sendAsset.getCode()} | DestAmount: ${op.destAmount} ${op.destAsset.getCode()}`;
            } else if (op.type === 'manageSellOffer' || op.type === 'manageBuyOffer') {
                details += ` | Selling: ${op.selling.getCode()} | Buying: ${op.buying.getCode()} | Amount: ${op.amount} | Price: ${op.price}`;
            } else if (op.type === 'changeTrust') {
                details += ` | Asset: ${op.line.getCode()}:${op.line.getIssuer()} | Limit: ${op.limit}`;
            } else if (op.type === 'setOptions') {
                details += Object.entries(op).filter(([k,v]) => k !== 'type' && v !== undefined && v !== null).map(([k,v]) => ` | ${k}: ${v}`).join('');
            }
            return details;
        });
        result.summary = {
            source: tx.source,
            fee: tx.fee,
            sequence: tx.sequence.toString(),
            memo: tx.memo && tx.memo.value ? tx.memo.toString() : (tx.memo && tx.memo.type === 'none' ? 'None' : String(tx.memo)), // Handle MemoNone explicitly
            operationCount: tx.operations.length,
            operations: operations,
            network: currentNetworkPassphrase === Networks.PUBLIC ? 'Public' : (currentNetworkPassphrase === Networks.TESTNET ? 'Testnet' : 'Custom'),
        };

        // FR3.3: Txrep-представление транзакции. (stellar-sdk does not have a direct txrep generator)
        // Txrep is more of a conceptual representation; for now, we can point to tools or give raw XDR.
        // Or, provide a simpler "envelope" like structure.
        // For now, we'll provide the JSON representation of the transaction object itself, which is quite detailed.
        // True "txrep" might involve converting to a specific string format not directly in SDK.
        // Let's use toEnvelope().toXDR('base64') again as a stand-in or provide the JSON.
        // The `transaction.toJSON()` method provides a rich JSON output.
        result.txrep = `Txrep generation is complex. Raw XDR: ${xdrB64}. Full JSON representation provided.`;

        // FR3.4: JSON-представление XDR.
        // The toJSON method on the transaction object is very comprehensive.
        result.json = JSON.stringify(tx.toJSON(), null, 2);

    } catch (e: any) {
        result.summary = { error: `XDR Parsing/Analysis Error: ${e.message}` };
        result.txrep = `XDR Parsing/Analysis Error: ${e.message}`;
        result.json = `XDR Parsing/Analysis Error: ${e.message}`;
        console.error("Error processing XDR:", e);
    }
    return result;
}

export function processReplaceInstructions(replaceStr: string): ReplaceInstructionData {
    const result: ReplaceInstructionData = {
        raw: replaceStr,
        fields: [],
        isValid: true, // Assume valid until an error is found
        errors: []
    };

    if (!replaceStr || replaceStr.trim() === "") {
        result.isValid = false;
        result.errors.push({ message: "Replace string is empty." });
        return result;
    }

    // Attempt to support both common formats, but prioritize semicolon-separated for URI simplicity.
    // Check if it looks like the JSON array format "[[...]]"
    if (replaceStr.startsWith("[[") && replaceStr.endsWith("]]")) {
        try {
            const parsedArray = JSON.parse(replaceStr);
            if (Array.isArray(parsedArray)) {
                parsedArray.forEach((item, index) => {
                    if (Array.isArray(item) && item.length === 2 && typeof item[0] === 'string' && typeof item[1] === 'string') {
                        result.fields.push({ field: item[0], value: item[1], hint: `Path to replace. Value must be a string.` });
                    } else {
                        result.isValid = false;
                        result.errors.push({ message: `Invalid item format in replace array at index ${index}. Expected [path, value].` });
                    }
                });
            }
        } catch (e: any) {
            result.isValid = false;
            result.errors.push({ message: `Failed to parse replace string as JSON array: ${e.message}` });
        }
    } else { // Assume semicolon-separated format: path:value;path:value
        const pairs = replaceStr.split(';');
        pairs.forEach(pairStr => {
            if (pairStr.trim() === "") return; // Skip empty segments (e.g., trailing semicolon)
            const parts = pairStr.split(/:(.*)/s); // Split on the first colon only, value can contain colons
            if (parts.length === 3 && parts[0].trim() !== "") { // parts[0] is path, parts[1] is value, parts[2] is empty string
                const path = parts[0].trim();
                const value = parts[1]; // Value is not trimmed to preserve potential spaces
                // Basic validation for path (can be more complex, e.g. matching known XDR field paths)
                // For now, any non-empty string is a 'valid' path format-wise.
                // Actual applicability of the path to an XDR structure is a deeper validation step.
                result.fields.push({ field: path, value: value, hint: 'Path to a field in the transaction envelope. Value must be a string.' });
            } else {
                result.isValid = false;
                result.errors.push({ message: `Invalid field:value pair format: "${pairStr}". Expected "path:value".` });
            }
        });
    }

    if (result.fields.length === 0 && result.errors.length === 0) {
      result.isValid = false;
      result.errors.push({ message: "No valid replace instructions found in the provided string." });
    }

    return result;
}
