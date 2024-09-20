const EsewaIntegration = require("./esewaIgServer");
const processPaymentfailure = require("./handlePaymentFailure");
const processPaymentSuccess = require("./processPaymentSuccess");

// Default export
module.exports = EsewaIntegration;

// Named exports
module.exports.processPaymentfailure = processPaymentfailure;
module.exports.processPaymentSuccess = processPaymentSuccess;
