import CryptoJS from "crypto-js";

const decodeHash = (message: string): any => {
  try {
    const decodedHash = CryptoJS.enc.Base64.parse(message);
    const decodedMessage = CryptoJS.enc.Utf8.stringify(decodedHash);
    return JSON.parse(decodedMessage);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error("Error decoding hash to JSON: " + error.message);
    }
    throw new Error("Error decoding hash to JSON: Unknown error");
  }
};

export default decodeHash;
