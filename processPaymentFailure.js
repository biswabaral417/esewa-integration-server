/**
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
const processPaymentFailure = (req, res, next) => {
    try {
        req.transactionUUID = req.cookies.transaction_uuid;
        if (transactionUUID) {
            res.clearCookie("transaction_uuid");
        }
        next()
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

}
module.exports = processPaymentFailure