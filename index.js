const EsewaIntegration = require("./esewaIgServer");
const handlePaymentFailure = require("./handlePaymentFailure");
const handlePaymentSuccess = require("./handlePaymentSuccess");

// Default export
module.exports = EsewaIntegration;

// Named exports
module.exports.handlePaymentFailure = handlePaymentFailure;
module.exports.handlePaymentSuccess = handlePaymentSuccess;
