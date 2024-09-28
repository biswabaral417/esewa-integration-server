const decodeHash = require("./decodeHash");
const verifyPaymentSignature = require("./verifyPaymentSignature");

/**
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const processPaymentSuccess = async (req, res, next, secretKey) => {
  try {
    const decodedHash = decodeHash(req.query.data);
    res.clearCookie("transaction_uuid");
    const isSignatureValid = verifyPaymentSignature(decodedHash, secretKey);
    if (!isSignatureValid) {
      return res.status(400).json({ error: 'Invalid payment signature.' });
    }
    req.params = decodedHash
    next()
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = processPaymentSuccess;
