# Esewa Integration Package

A Node.js package for integrating with eSewa payment gateway. This package provides an easy way to handle payment success and failure notifications.

## Installation

To install the package, run:

```bash
    npm install esewa-integration-package
```

# initilize integration

```js
    const BaseEsewaIntegration = require("esewa-integration-package");

    // Initialize with custom configuration
    const esewa = new BaseEsewaIntegration({
    secretKey: "your-esewa-secret-key", // Your eSewa secret key
    productCode: "EPAYTEST", // Your product code
    successUrl: "https://yourdomain.com/payment/success", // URL to handle successful payments
    failureUrl: "https://yourdomain.com/payment/failure", // URL to handle failed payments
    });
```

# Create paymentForm data

```js
    // Define order details
    // Define order detailsGils take picture like this and still get jealous & hate each other 😂
const additionalFields = {
  productDeliveryCharge: 50, // Additional delivery charge
  productServiceCharge: 30, // Additional service charge
  taxAmount: 10, // Tax amount
};

// Generate payment form data
const formData = esewa.createPaymentFormData(orderDetails, additionalFields);

// Log the generated formData for integration
console.log("Generated Payment Form Data:", formData);

```

# handle payment failure and success

```js
    const express = require('express');
    const app = express();
    const BaseEsewaIntegration = require('esewa-integration-package');

    const esewa = new BaseEsewaIntegration({
    secretKey: "your-esewa-secret-key",
    productCode: "EPAYTEST",
    successUrl: "https://yourdomain.com/payment/success",
    failureUrl: "https://yourdomain.com/payment/failure",
    });

    // Example of handling payment success
    app.get('/payment/success', async (req, res) => {
    try {
        await esewa.handlePaymentSuccess(req, res);
    } catch (error) {
        console.error('Error handling payment success:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    });
```


# example RouteHandler for failure
```js
    const express = require('express');
    const app = express();
    const BaseEsewaIntegration = require('esewa-integration-package');

    const esewa = new BaseEsewaIntegration({
    secretKey: "your-esewa-secret-key",///process.env.esewakey
    productCode: "EPAYTEST",//default for testing
    successUrl: "https://yourdomain.com/payment/success",
    failureUrl: "https://yourdomain.com/payment/failure",
    });

    // Example of handling payment failure
    app.get('/payment/failure', async (req, res) => {
    try {
        await esewa.handlePaymentFailure(req, res);
    } catch (error) {
        console.error('Error handling payment failure:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    });

```

# below is an example of handling success
# you need to implement this and use functions to implement the database logics and other custom logics you want to integrate

   ```js
   // Set custom success handler
    esewa.setSuccessHandler(async (decodedHash) => {
    console.log('Payment Success Data:', decodedHash);
    // Implement custom success logic here
    });

    // Set custom failure handler
    esewa.setFailureHandler(async (decodedHash) => {
    console.log('Payment Failure Data:', decodedHash);
    // Implement custom failure logic here
    });
```