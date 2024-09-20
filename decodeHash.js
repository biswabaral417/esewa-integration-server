const CryptoJS = require('crypto-js');

const decodeHash = (message) => {
  try {
    const decodedHash = CryptoJS.enc.Base64.parse(message);
    const decodedMessage = CryptoJS.enc.Utf8.stringify(decodedHash);
    return JSON.parse(decodedMessage);
  } catch (error) {
    throw new Error('Error decoding hash to JSON: ' + error.message);
  }
};

module.exports = decodeHash;
