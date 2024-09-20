### RSewa Integration Package

# A Node.js package for integrating with the eSewa payment gateway. This package provides an easy way to handle payment success and failure notifications.

### Installation

## To install the package, run:

```bash

npm install esewa-integration-package
```

## Initialize Integration

```js
const EsewaIntegration = require("esewa-integration-package");

// Initialize with custom configuration
const esewa = new EsewaIntegration({
  secretKey: process.env.ESEWA_SECRET_KEY || "your-esewa-secret-key", // Your eSewa secret key
  successUrl: "https://yourdomain.com/payment/success", // URL to handle successful payments
  failureUrl: "https://yourdomain.com/payment/failure", // URL to handle failed payments
});
```

## Initiate Payment

# Create an Endpoint to Receive Payment Data

```js
router.post("/api/pay", handlePayment);
```

# In Your Function to handlePayment

```js
const handlePayment = (req, res) => {
  const { total_amount, productsObject, otherData } = req.body; // You may also send and receive in req.query if preferred

  // Your logic for saving the order/subscription/transaction details
  const order = new Order({ total_amount, productsObject, otherData }); // Example object using a dummy Mongoose schema
  order
    .save()
    .then((savedOrder) => {
      const uuid = savedOrder._id; // MongoDB provides an _id after saving
      return esewa.initiatePayment(
        { total_amount, transactionUUID: uuid },
        res
      ); // Redirect client to eSewa payment
    })
    .catch((error) => {
      console.error("Error saving order:", error.message);
      res.status(500).json({ error: "Failed to save order." });
    });
};
```

## Handle Payment Success

```js

app.get("/payment/success", async (req, res) => {
  try {
    const { transaction_uuid, amount, ...otherFields } = req.params; // Use req.query for GET parameters

    // no need to verify signature as it is already verifid
    const redirectUrl = 'http://localhost:3000/home'; // Ensure this URL is correct
    const messageProps = {
      paymentSuccess: 'Yay!',
      thanks: 'Thank you for your order!'
    }; // Optional message properties
    esewa.redirectToClientSite(res, redirectUrl, messageProps);
  } catch (error) {
    console.error("Error handling payment success:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
```
# Handle Payment Failure
```js

app.get("/payment/failure", async (req, res) => {
  try {
    const redirectUrl = 'http://localhost:3000/home'; // Ensure this URL is correct
    const messageProps = {
      paymentFailed: 'Oops!',
      sorry: 'Sorry, your payment failed.'
    };

    esewa.redirectToClientSite(res, redirectUrl, messageProps);
  } catch (error) {
    console.error("Error handling payment failure:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

````
