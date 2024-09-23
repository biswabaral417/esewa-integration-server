const CryptoJS = require('crypto-js');

const verifyPaymentSignature =  (paymentData, secretKey) => {
  try {
    const { signed_field_names, signature, ...fields } = paymentData;
    const message = signed_field_names.split(",").map((field) => (
      field === "total_amount" ? "total_amount=" + paymentData["total_amount"].split(",").join("") :
        `${field}=${paymentData[field] || ""}`
    )).join(",");
    const expectedSignature = CryptoJS.HmacSHA256(message, secretKey);
    const encodedSignature = CryptoJS.enc.Base64.stringify(expectedSignature);

    if (signature !== encodedSignature) {
      throw new Error("Signature verification failed.");
    }
    return true;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    throw new Error('Failed to verify payment signature.');
  }
};

module.exports = verifyPaymentSignature;
