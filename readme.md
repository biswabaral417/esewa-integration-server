

# eSewa Integration Package

A Node.js package for integrating with the eSewa payment gateway. This package provides an easy way to handle payment success and failure notifications.

## Installation

To install the package, run:

```bash
npm install esewa-integration-package
```

## Initialize Integration
# To set up the integration, use the following code:

```js
const EsewaIntegration = require("esewa-integration-package");

// Initialize with custom configuration
const esewa = new EsewaIntegration({
  secretKey: process.env.ESEWA_SECRET_KEY || "your-esewa-secret-key", // Your eSewa secret key
  successUrl: "https://yourdomain.com/payment/success", // URL to handle successful payments
  failureUrl: "https://yourdomain.com/payment/failure", // URL to handle failed payments
});
```
# // Note: There is no processPaymentFailure middleware in this class as no data is returned by eSewa apart from hitting your failure URL.

## Initiate Payment
# Create an endpoint to receive payment data. This sends an auto-submitting form, so make sure this is a separate link on your website that can be accessed.

```js
app.get("/esewa/initiate", (req, res) => {
  const { total_amount, transactionUuid } = req.query; // You can also send these details in req.body

  console.log(req.query); // Log the query parameters for debugging

  // Call the initiatePayment method from the eSewa instance
  const { productsObject, otherData } = req.body;

  // Your logic for saving the order/subscription/transaction details
  const order = new Order({ total_amount, productsObject, otherData, status: 'initializing payment' });
  
  order.save()
    .then((savedOrder) => {
      const uuid = savedOrder._id; // MongoDB provides an _id after saving
      return esewa.initiatePayment(
        {
          total_amount: total_amount, // Total amount to be paid (required)
          transactionUUID: transactionUuid, // Unique transaction identifier (required)
          amount: total_amount, // Amount being passed (optional)
          productCode: "EPAYTEST", // Product code (optional)
        },
        res
      ); // Redirect client to eSewa payment
    })
    .catch((error) => {
      console.error("Error saving order:", error.message);
      res.status(500).json({ error: "Failed to save order." });
    });
});

```
## Handle Payment Success
# Define the endpoint for handling successful payments.

```js
app.get("/payment/success", esewa.processPaymentSuccess, async (req, res) => {
  try {
    const { transaction_uuid, amount, ...otherFields } = req.params; // Use req.query for GET parameters

    // Note: The signature verification is handled in the middleware

    // Find the order by transaction_uuid and update its status to "paid"
    const order = await Order.findById(transaction_uuid);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    order.status = "paid"; // Update the order status
    await order.save(); // Save the updated order

    // Prepare the redirect URL and optional message properties
    const redirectUrl = "http://localhost:3000/home"; // Ensure this URL is correct
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
## Handle Payment Failure
# Define the endpoint for handling failed payments.

```js
app.get("/payment/failure", async (req, res) => {
  try {
    const redirectUrl = "http://localhost:3000/home"; // Ensure this URL is correct
    const messageProps = {
      paymentFailed: "Oops!",
      sorry: "Sorry, your payment failed.",
    };

    // Retrieve the transaction UUID from the cookie
    const transactionUUID = req.cookies.transaction_uuid;

    if (transactionUUID) {
      // Delete the order associated with the transaction UUID
      await Order.deleteOne({ _id: transactionUUID }); // Adjust as necessary for your database schema
      console.log(`Order with transaction UUID ${transactionUUID} has been deleted.`);
      
      // Clear the cookie to prevent future issues
      res.clearCookie('transaction_uuid');
    }

    // Redirect the client to the specified URL with message properties
    esewa.redirectToClientSite(res, redirectUrl, messageProps);
  } catch (error) {
    console.error("Error handling payment failure:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
```
## Additional Notes
# Make sure to have appropriate error handling in place.
# Update the success and failure URLs as needed for your production environment.
# Consider implementing logging for better traceability of issues.
## License
# This package is licensed under the MIT License.

## Feel free to customize any sections to better fit your package or add additional details as necessary!