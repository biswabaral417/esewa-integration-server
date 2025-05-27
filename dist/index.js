"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/processPayments/processPaymentFailure.ts
var processPaymentFailure = (req, res, next) => {
  try {
    const transactionUUID = req.cookies.transaction_uuid;
    if (transactionUUID) {
      req.transactionUUID = transactionUUID;
      res.clearCookie("transaction_uuid");
    }
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred." });
  }
};
var processPaymentFailure_default = processPaymentFailure;

// src/utils/verifyPaymentSignature.ts
var import_crypto_js = __toESM(require("crypto-js"));
var verifyPaymentSignature = (paymentData, secretKey) => {
  try {
    const { signed_field_names = "", signature } = paymentData;
    if (!signed_field_names || !signature) {
      throw new Error("Missing signed_field_names or signature");
    }
    const message = signed_field_names.split(",").map((field) => {
      var _a;
      let value = (_a = paymentData[field]) != null ? _a : "";
      if (field === "total_amount" && typeof value === "string") {
        value = value.split(",").join("");
      }
      return `${field}=${value}`;
    }).join(",");
    const expectedSignature = import_crypto_js.default.HmacSHA256(message, secretKey);
    const encodedSignature = import_crypto_js.default.enc.Base64.stringify(expectedSignature);
    if (signature !== encodedSignature) {
      throw new Error("Signature verification failed.");
    }
    return true;
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    throw new Error("Failed to verify payment signature.");
  }
};
var verifyPaymentSignature_default = verifyPaymentSignature;

// src/utils/decodeHash.ts
var import_crypto_js2 = __toESM(require("crypto-js"));
var decodeHash = (message) => {
  try {
    const decodedHash = import_crypto_js2.default.enc.Base64.parse(message);
    const decodedMessage = import_crypto_js2.default.enc.Utf8.stringify(decodedHash);
    return JSON.parse(decodedMessage);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Error decoding hash to JSON: " + error.message);
    }
    throw new Error("Error decoding hash to JSON: Unknown error");
  }
};
var decodeHash_default = decodeHash;

// src/processPayments/processPaymentSuccess.ts
var processPaymentSuccess = async (req, res, next, secretKey) => {
  try {
    if (!req.query.data) {
      return res.status(400).json({ error: "Missing data query parameter." });
    }
    const decodedHash = decodeHash_default(req.query.data);
    res.clearCookie("transaction_uuid");
    const isSignatureValid = verifyPaymentSignature_default(decodedHash, secretKey);
    if (!isSignatureValid) {
      return res.status(400).json({ error: "Invalid payment signature." });
    }
    req.params = decodedHash;
    next();
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred." });
  }
};
var processPaymentSuccess_default = processPaymentSuccess;

// src/utils/createSignatute.ts
var CryptoJS3 = require("crypto-js");
var createSignature = (secretKey, message) => {
  try {
    const hash = CryptoJS3.HmacSHA256(message, secretKey);
    return CryptoJS3.enc.Base64.stringify(hash);
  } catch (error) {
    console.error("Error creating signature:", error);
    throw new Error("Failed to create signature.");
  }
};

// src/initiatePayment.ts
var initiatePayment = ({
  total_amount,
  amount,
  transactionUUID,
  productDeliveryCharge = 0,
  productServiceCharge = 0,
  taxAmount = 0,
  productCode = "EPAYTEST",
  responseType = "html"
}, esewaOptions, res) => {
  try {
    if (!transactionUUID || !total_amount || !amount) {
      throw new Error(
        "amount, total_amount, and Transaction UUID are required."
      );
    }
    res.clearCookie("transaction_uuid", { path: "/" });
    const message = `transaction_uuid=${transactionUUID},product_code=${productCode},total_amount=${total_amount}`;
    const signature = createSignature(esewaOptions.secretKey, message);
    res.cookie("transaction_uuid", transactionUUID, {
      maxAge: 3e4,
      httpOnly: true,
      secure: esewaOptions.secure,
      sameSite: esewaOptions.sameSite
    });
    const formFields = {
      amount,
      product_delivery_charge: productDeliveryCharge,
      product_service_charge: productServiceCharge,
      product_code: productCode,
      signature,
      signed_field_names: "transaction_uuid,product_code,total_amount",
      failure_url: esewaOptions.failureUrl,
      success_url: esewaOptions.successUrl,
      tax_amount: taxAmount,
      total_amount,
      transaction_uuid: transactionUUID
    };
    if (responseType === "json") {
      return res.status(200).json({
        formAction: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        formMethod: "POST",
        formFields
      });
    }
    const formHtml = `
      <html>
      <body onload="document.forms['esewaForm'].submit()">
          <form id="esewaForm" action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
              ${Object.entries(formFields).map(
      ([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`
    ).join("\n")}
          </form>
      </body>
      </html>
    `;
    res.status(200).send(formHtml);
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).send({
      error: "Failed to initiate payment.",
      message: error.message
    });
  }
};

// src/checkStatus.ts
async function checkTransactionStatus({
  product_code,
  transaction_uuid,
  total_amount,
  isProduction = false
}) {
  const baseUrl = isProduction ? "https://epay.esewa.com.np" : "https://rc.esewa.com.np";
  const url = new URL(`${baseUrl}/api/epay/transaction/status/`);
  url.searchParams.set("product_code", product_code);
  url.searchParams.set("transaction_uuid", transaction_uuid);
  url.searchParams.set("total_amount", total_amount.toString());
  const res = await fetch(url.toString());
  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Failed to fetch transaction status: ${res.status} - ${res.statusText}
${errorBody}`
    );
  }
  const data = await res.json();
  return data;
}

// src/index.ts
var EsewaIntegration = class {
  constructor(options) {
    var _a, _b, _c, _d;
    const resolvedOptions = {
      secretKey: (_a = options.secretKey) != null ? _a : "8gBm/:&EnhH.1/q",
      successUrl: (_b = options.successUrl) != null ? _b : "http://localhost:9000/api/esewaPayment/success",
      failureUrl: (_c = options.failureUrl) != null ? _c : "http://localhost:9000/api/esewaPayment/failure",
      secure: !!options.secure,
      sameSite: (_d = options.sameSite) != null ? _d : "lax"
    };
    this.secretKey = resolvedOptions.secretKey;
    this.successUrl = resolvedOptions.successUrl;
    this.failureUrl = resolvedOptions.failureUrl;
    this.secure = resolvedOptions.secure;
    this.sameSite = resolvedOptions.sameSite;
    this.processPaymentSuccess = this.processPaymentSuccess.bind(this);
  }
  initiatePayment(params, res) {
    initiatePayment(params, {
      secretKey: this.secretKey,
      successUrl: this.successUrl,
      failureUrl: this.failureUrl,
      secure: this.secure,
      sameSite: this.sameSite
    }, res);
  }
  redirectToClientSite(res, redirectURL, messageProps = {}) {
    const queryParams = new URLSearchParams(messageProps).toString();
    const redirectUrl = `${redirectURL}?${queryParams}`;
    res.redirect(redirectUrl);
  }
  processPaymentSuccess(req, res, next) {
    return processPaymentSuccess_default(req, res, next, this.secretKey);
  }
  processPaymentFailure(req, res, next) {
    return processPaymentFailure_default(req, res, next);
  }
  static async getTransactionStatus(params) {
    return checkTransactionStatus(params);
  }
};
var index_default = EsewaIntegration;
