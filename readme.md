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
# get your secret key for testin here "http://developer.esewa.com.np/pages/Epay#integration"

# // Note: There is no processPaymentFailure middleware in this class as no data is returned by eSewa while hitting your failure URL.

## Initiate Payment

# Create an endpoint to receive payment data. This sends an auto-submitting form, so make sure this is a separate link on your website that can be accessed. this method also sets an cookie called transaction_uuid to track the payment

```js
app
  .get("/esewa/initiate", async (req, res) => {
    const { total_amount, transactionUuid } = req.query; // You can also send these details in req.body
    // Call the initiatePayment method from the eSewa instance
    const { productsObject, otherData } = req.body; //you may want to send other details you want to save instead in req.query

    //save order this is an example in mongodb you can use your prefered db to save and other logics
    // Your logic for saving the order/subscription/transaction details
    const order = new Order({
      total_amount,
      productsObject,
      otherData,
      status: "initializing payment",
    });

    const savedOrder = await order.save();
    const uuid = savedOrder._id; // MongoDB provides an _id after saving

    //use the esewa.initiatePayment function to intitiate payment process this will send client a auto submitting form
    esewa.initiatePayment(
      {
        total_amount: total_amount, // Total amount to be paid (required)
        transactionUUID: uuid, // Unique transaction identifier (required)
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
```

## Handle Payment Success

# Define the endpoint for handling successful payments.

```js
const processPaymentSucess=esewa.processPaymentSuccess
app.get("/payment/success",processPaymentSucess , async (req, res) => {
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
    // Redirect the client to the specified URL with message properties  use esewa.redirect function to redirect with message
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
      console.log(
        `Order with transaction UUID ${transactionUUID} has been deleted.`
      );

      // Clear the cookie to prevent future issues
      res.clearCookie("transaction_uuid");
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

# details of methods

# initialization class

```js
const esewa = new EsewaIntegration({
  secretKey: process.env.ESEWA_SECRET_KEY || "your-esewa-secret-key", // Your eSewa secret key  
  //  u can get esewa key for testin purposeshere http://developer.esewa.com.np/pages/Epay#integration 
// For UAT, SecretKey will be "**secretkey" ( Input should be text type.) "**the secret key is availble on avove link" 
successUrl: "https://yourdomain.com/payment/success", // URL to handle successful payments
  failureUrl: "https://yourdomain.com/payment/failure", // URL to handle failed payments
});
```

# this class has following methods

```js
const paymentSuccess = esewa.processPaymentSuccess;
/*this is supposed to be used as a middleway in your success route*/
/* it attaches the responsefrom esewa when successURl is hit to req.params*/
```

```js
  esewa.redirectToClientSite();//this method is meant to redirect to the client site from the server endpoint to get esewa payment success 
  // this method take two three inputs redirect url message props and res ,
  // res is the response from your server, redirect url is the page you want to redirect to 
  // message is optional feild you may want to use it takes an object that is then passed to cleint as query while redirecting 
    const redirectUrl = "http://localhost:3000/home"; // Ensure this URL is correct
    const messageProps = {
      paymentFailed: "Oops!",
      sorry: "Sorry, your payment failed.",
    };
```

# Make sure to have appropriate error handling in place.

# Update the success and failure URLs as needed for your production environment.

# Consider implementing logging for better traceability of issues.

## License

# This package is licensed under the MIT License.

## Feel free to customize any sections to better fit your package or add additional details as necessary!
