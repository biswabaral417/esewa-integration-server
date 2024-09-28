# ESewa Integration server pakage

# A Node.js package for integrating with the eSewa payment gateway. This package provides an easy way to handle payment success and failure notifications.

Installation

# To install the package, run:

```bash

npm install esewa-integration-server
```

# Initialize Integration

To set up the integration, use the following code:

```js
const EsewaIntegration = require("esewa-integration-server");

// Initialize with custom configuration
const esewa = new EsewaIntegration({
  secretKey: process.env.ESEWA_SECRET_KEY || "your-esewa-secret-key", // Your eSewa secret key
  successUrl: "https://yourdomain.com/payment/success", // URL to handle successful payments
  failureUrl: "https://yourdomain.com/payment/failure", // URL to handle failed payments
});
```

you can also change the methods to set cookies :

```js
const esewa = new EsewaIntegration({
  secretKey: process.env.ESEWA_SECRET_KEY || "your-esewa-secret-key",
  successUrl: "https://yourdomain.com/payment/success",
  failureUrl: "https://yourdomain.com/payment/failure",
  sameSite: "strict",
  secure: "true",
});
```

# Get Your Secret Key

You can get your secret key for testing at "http://developer.esewa.com.np/pages/Epay#integration"

# Initiate Payment

To intitate payment

```js
app
  .get("/esewa/initiate", async (req, res) => {
    const { total_amount, transactionUuid } = req.query; // You can also send these details in req.body
    const { productsObject, otherData } = req.body; // Optional details you may want to save instead in req.query

    // Save order (example using MongoDB)
    const order = new Order({
      total_amount,
      productsObject,
      otherData,
      status: "initializing payment",
    });

    const savedOrder = await order.save();
    const uuid = savedOrder._id; // MongoDB provides an _id after saving

    // Initiate payment process
    esewa.initiatePayment(
      {
        total_amount, // Total amount to be paid (required)
        transactionUUID: uuid, // Unique transaction identifier (required)
        amount: total_amount, // Amount being passed (required)
        productCode: "EPAYTEST", // Product code (optional)


      //there are other optional feilds too
        // productDeliveryCharge = 0,
        // productServiceCharge = 0,
        // taxAmount = 0,
      }
      res // Send the response object
    );
  })
  .catch((error) => {
    console.error("Error saving order:", error.message);
    res.status(500).json({ error: "Failed to save order." });
  });
```

# Handle Payment Success

Define the endpoint for handling successful payments:

```js
const processPaymentSuccess = esewa.processPaymentSuccess;
app.get("/payment/success", processPaymentSuccess, async (req, res) => {
  try {
    const { transaction_uuid, amount, ...otherFields } = req.params; // Use req.query for GET parameters

    // Find the order by transaction_uuid and update its status to "paid"
    const order = await Order.findById(transaction_uuid);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    order.status = "paid"; // Update the order status
    await order.save(); // Save the updated order

    // Prepare the redirect URL and optional message properties
    const redirectUrl = "http://localhost:3000/success"; // Ensure this URL is correct
    const messageProps = {
      paymentSuccess: "Yay!",
      thanks: "Thank you for your order!",
    };

    // Redirect the client to the specified URL with message properties
    esewa.redirectToClientSite(res, redirectUrl, messageProps);
  } catch (error) {
    console.error("Error handling payment success:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
```

# Handle Payment Failure

Define the endpoint for handling failed payments:

```js
const processPaymentFailure = esewa.processPaymentFailure;

app.get("/payment/failure", processPaymentFailure, async (req, res) => {
  try {
    const redirectUrl = "http://localhost:3000/failure"; // Ensure this URL is correct
    const messageProps = {
      paymentFailed: "Oops!",
      sorry: "Sorry, your payment failed.",
    };

    // Retrieve the transaction UUID from the cookie
    const transactionUUID = req.transactionUUID;

    if (transactionUUID) {
      // Delete the order associated with the transaction UUID
      await Order.deleteOne({ _id: transactionUUID }); // Adjust as necessary for your database schema
      console.log(
        `Order with transaction UUID ${transactionUUID} has been deleted.`
      );
    }

    // Redirect the client to the specified URL with message properties
    esewa.redirectToClientSite(res, redirectUrl, messageProps);
  } catch (error) {
    console.error("Error handling payment failure:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
```

# Additional Notes

Details of Methods
Initialization Class

```js
const esewa = new EsewaIntegration({
  secretKey: process.env.ESEWA_SECRET_KEY || "your-esewa-secret-key",
  successUrl: "https://yourdomain.com/payment/success",
  failureUrl: "https://yourdomain.com/payment/failure",
});
```

# This class has the following methods:

```js
esewa.processPaymentSuccess; //Used as middleware in your success route, it attaches the response from eSewa when the success URL is hit to req.params.

esewa.processPaymentFailure; // Handles payment failure.meant to be used as url

esewa.redirectToClientSite(); // Redirects to the client site with message properties
```

# Important Considerations

    Make sure to implement appropriate error handling.
    Update the success and failure URLs as needed for your production environment.
    Consider implementing logging for better traceability of issues.

# License

This package is licensed under the MIT License.
