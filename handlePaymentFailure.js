/**
 * Handles the payment failure logic, including logging and calling handleFailure.
 * @param {Object} instance - An instance of the BaseEsewaIntegration class.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
async function handlePaymentFailure(req, res,next) {
  next()
}

module.exports = handlePaymentFailure;
