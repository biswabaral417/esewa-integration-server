const CryptoJS = require('crypto-js');

const createSignature = (secretKey, message) => {
  try {
    const hash = CryptoJS.HmacSHA256(message, secretKey);
    return CryptoJS.enc.Base64.stringify(hash);
  } catch (error) {
    console.error('Error creating signature:', error);
    throw new Error('Failed to create signature.');
  }
};

module.exports = createSignature;
