const createSignature = require("./createSignature");

/**
 * Creates form data for eSewa payment integration.
 * @param {Object} options - The payment options including amount, product code, and success/failure URLs.
 * @param {Object} orderDetails - The order-specific details like amount, transaction UUID, etc.
 * @param {String} secretKey - The eSewa API secret key.
 * @returns {Object} formData - Form data for eSewa payment.
 */
const createEsewaFormData = ({ amount, productCode, successUrl, failureUrl, productDeliveryCharge = 0, productServiceCharge = 0, taxAmount = 0 }, orderDetails, secretKey) => {
  if (!amount || !orderDetails.transactionUUID || !productCode || !secretKey) {
    throw new Error("Missing required parameters for eSewa payment.");
  }

  // Remove commas and other non-numeric characters from amount and optional fields
  const sanitizedAmount = amount.toString().replace(/,/g, '');
  const sanitizedProductDeliveryCharge = productDeliveryCharge.toString().replace(/,/g, '');
  const sanitizedProductServiceCharge = productServiceCharge.toString().replace(/,/g, '');
  const sanitizedTaxAmount = taxAmount.toString().replace(/,/g, '');

  // Create the message with all the signed fields
  let message = `amount=${sanitizedAmount},transaction_uuid=${orderDetails.transactionUUID},product_code=${productCode},product_delivery_charge=${sanitizedProductDeliveryCharge},product_service_charge=${sanitizedProductServiceCharge},tax_amount=${sanitizedTaxAmount},total_amount=${sanitizedAmount},success_url=${successUrl || "http://localhost:9000/api/esewaPayment/success"},failure_url=${failureUrl || "http://localhost:9000/api/esewaPayment/failure"}`;

  const signature = createSignature(message, secretKey);

  const formData = {
    amount: sanitizedAmount,
    failure_url: failureUrl || "http://localhost:9000/api/esewaPayment/failure", // default failure URL
    product_delivery_charge: sanitizedProductDeliveryCharge,
    product_service_charge: sanitizedProductServiceCharge,
    product_code: productCode,
    signature: signature,
    signed_field_names: "amount,transaction_uuid,product_code,product_delivery_charge,product_service_charge,tax_amount,total_amount,success_url,failure_url",
    success_url: successUrl || "http://localhost:9000/api/esewaPayment/success", // default success URL
    tax_amount: sanitizedTaxAmount,
    total_amount: sanitizedAmount,
    transaction_uuid: orderDetails.transactionUUID
  };

  return formData;
};

module.exports = createEsewaFormData;
