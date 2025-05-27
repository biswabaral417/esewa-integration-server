import CryptoJS from 'crypto-js';

interface PaymentData {
  signed_field_names?: string;
  signature?: string;
  [key: string]: any; // Allow other fields with string keys and any values
}

const verifyPaymentSignature = (paymentData: PaymentData, secretKey: string): boolean => {
  try {
    const { signed_field_names = "", signature } = paymentData;

    if (!signed_field_names || !signature) {
      throw new Error("Missing signed_field_names or signature");
    }

    const message = signed_field_names
      .split(",")
      .map((field) => {
        let value = paymentData[field] ?? "";
        if (field === "total_amount" && typeof value === "string") {
          value = value.split(",").join("");
        }
        return `${field}=${value}`;
      })
      .join(",");

    const expectedSignature = CryptoJS.HmacSHA256(message, secretKey);
    const encodedSignature = CryptoJS.enc.Base64.stringify(expectedSignature);

    if (signature !== encodedSignature) {
      throw new Error("Signature verification failed.");
    }

    return true;
  } catch (error) {
    console.error("Error verifying payment signature:", error);
    throw new Error("Failed to verify payment signature.");
  }
};

export default verifyPaymentSignature;
