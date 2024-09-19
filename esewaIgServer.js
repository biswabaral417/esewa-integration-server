const CryptoJS = require('crypto-js');

/**
 * Integration class for eSewa payment gateway.
 * Handles signature creation, payment form data generation, and signature verification.
 */
class EsewaIntegration {
  /**
   * Constructs an instance of the EsewaIntegration class.
   * @param {Object} config - Configuration object for eSewa integration.
   * @param {string} config.secretKey - Secret key for generating HMAC signatures.
   * @param {string} config.productCode - Product code for the eSewa payment.
   * @param {string} [config.successUrl] - URL to redirect to on successful payment (defaults to local URL).
   * @param {string} [config.failureUrl] - URL to redirect to on failed payment (defaults to local URL).
   */
  constructor({ secretKey, productCode, successUrl, failureUrl }) {
    if (!secretKey || !productCode) {
      throw new Error("Secret key and product code are required.");
    }
    this.secretKey = secretKey;
    this.productCode = productCode;
    this.successUrl = successUrl || "http://localhost:9000/api/esewaPayment/success";
    this.failureUrl = failureUrl || "http://localhost:9000/api/esewaPayment/failure";
  }

  /**
   * Creates an HMAC-SHA256 signature for a given message.
   * @param {string} message - The message to sign.
   * @returns {string} - The Base64 encoded signature.
   */
  createSignature(message) {
    try {
      const hash = CryptoJS.HmacSHA256(message, this.secretKey);
      return CryptoJS.enc.Base64.stringify(hash);
    } catch (error) {
      console.error('Error creating signature:', error);
      throw new Error('Failed to create signature.');
    }
  }

  /**
   * Decodes a Base64 encoded hash and parses it as JSON.
   * @param {string} message - The Base64 encoded hash to decode.
   * @returns {Object} - The parsed JSON object.
   * @throws {Error} - Throws an error if decoding or parsing fails.
   */
  decodeHash(message) {
    try {
      // Decode Base64 message
      const decodedHash = CryptoJS.enc.Base64.parse(message);

      // Convert the decoded message back to a UTF-8 string
      const decodedMessage = CryptoJS.enc.Utf8.stringify(decodedHash);

      // Parse the decoded message back to JSON
      return JSON.parse(decodedMessage);
    } catch (error) {
      throw new Error('Error decoding hash to JSON: ' + error.message);
    }
  }

  /**
   * Generates form data for eSewa payment.
   * Only includes selected fields in the signature.
   * @param {Object} orderDetails - Details specific to the order.
   * @param {string} orderDetails.amount - The total amount for the transaction.
   * @param {string} orderDetails.transactionUUID - Unique identifier for the transaction.
   * @param {Object} [optionalFields] - Optional fields for additional charges.
   * @param {number} [optionalFields.productDeliveryCharge=0] - Delivery charge for the product.
   * @param {number} [optionalFields.productServiceCharge=0] - Service charge for the product.
   * @param {number} [optionalFields.taxAmount=0] - Tax amount applicable to the order.
   * @returns {Object} - The formatted form data for eSewa payment.
   * @throws {Error} - Throws an error if required fields are missing.
   */
  createPaymentFormData(orderDetails, optionalFields = {}) {
    try {
      const { amount, transactionUUID } = orderDetails;

      if (!amount || !transactionUUID) {
        throw new Error("Amount and Transaction UUID are required.");
      }

      const {
        productDeliveryCharge = 0,
        productServiceCharge = 0,
        taxAmount = 0,
      } = optionalFields;

      // Create the message with selected fields
      const message = `transaction_uuid=${transactionUUID},product_code=${this.productCode},total_amount=${amount}`;
      const signature = this.createSignature(message);

      // Prepare form data for eSewa payment
      return {
        amount: amount,
        product_delivery_charge: productDeliveryCharge,
        product_service_charge: productServiceCharge,
        product_code: this.productCode,
        signature: signature,
        signed_field_names: "transaction_uuid,product_code,total_amount",
        failure_url: this.failureUrl,
        success_url: this.successUrl,
        tax_amount: taxAmount,
        total_amount: amount,
        transaction_uuid: transactionUUID,
      };
    } catch (error) {
      console.error('Error creating payment form data:', error);
      throw new Error('Failed to create payment form data.');
    }
  }

  /**
   * Verifies the payment signature received from eSewa.
   * @param {Object} paymentData - The payment data received from eSewa.
   * @param {string} paymentData.signed_field_names - Comma-separated list of signed fields.
   * @param {string} paymentData.signature - The signature to verify.
   * @param {string} paymentData.total_amount - Total amount of the payment.
   * @param {string} paymentData.transaction_uuid - Unique identifier for the transaction.
   * @returns {boolean} - True if the signature is valid, otherwise false.
   * @throws {Error} - Throws an error if signature verification fails.
   */
  verifyPaymentSignature(paymentData) {
    try {
      const { signed_field_names, signature, ...fields } = paymentData;

      // Construct the message to verify
      const message = signed_field_names.split(",").map((field) => (
        field === "total_amount" ? "total_amount=" + paymentData["total_amount"].split(",").join("") :
          `${field}=${paymentData[field] || ""}`
      )).join(",");

      // Generate the expected signature
      const expectedSignature = this.createSignature(message);

      // Verify the provided signature
      if (signature !== expectedSignature) {
        throw new Error("Signature verification failed.");
      }

      return true;
    } catch (error) {
      console.error('Error verifying payment signature:', error);
      throw new Error('Failed to verify payment signature.');
    }
  }
}

module.exports = EsewaIntegration;
