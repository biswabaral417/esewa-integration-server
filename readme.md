# ESewa Integration server pakage
# A Node.js package for integrating with the eSewa payment gateway. This package provides an easy way to handle payment success and failure notifications.

# Installation
To install the package, run:

```bash
    npm install esewa-integration-server
```
# initialize Integration

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
you can also change the methods to set cookies, the cookie set are used to track payment when the transaction fails :
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
Initiate Payment

# To intitate payment
```js
app
  .get("/esewa/initiate", async (req, res) => {
    const { total_amount } = req.query; // You can also send these details in req.body
    const uuid=somerandomuuid1231  //uuid generate an unique uuid
    esewa.initiatePayment(
      {
        total_amount, // Total amount to be paid (required)
        transactionUUID: uuid, // Unique transaction identifier (required)
        amount: total_amount, // Amount being passed (required)
        productCode: "EPAYTEST", // Product code (optional)

      //theother optional feilds 
        // productDeliveryCharge = 0,
        // productServiceCharge = 0,
        // taxAmount = 0,
      }
      res 
    );
  })
  .catch((error) => {
    console.error("Error saving order:", error.message);
    res.status(500).json({ error: "Failed to save order." });
  });
```
# if you are using react at frontend

you should do implement function that uses the html file you get as response,then document.open,document.write and document.close to redirect to esewa payment gateaway
```jsx
import React, { useState } from "react";

export default function YourFunction() {
  const [amt, setAmt] = useState("");

  const initiatePayment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/esewa/initiatePayment?total_amount=${amt}`,
        {
          method: "GET", // Adjust the method if necessary
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      //you can also send the amt and other feilds in req.body its your choice but adjust according in your backend too
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const html = await response.text(); // the response from esewa.initatePayment() is an html file 
      document.open();
      document.write(html);
      document.close();
    } catch (error) {
      // Handle error
      console.error("Error initiating payment:", error);
    }
  };

  return (
    {/*don't copy all these brother, this is my bs example react component */}
    <div>
      <input
        type="text"
        value={amt}
        onChange={(e) => setAmt(e.target.value)}
        placeholder="Enter amount"
      />
      <button onClick={initiatePayment}>Initiate Payment</button>
    </div>
  );
}

```
# Handle Payment Success

Define the endpoint for handling successful payments:

```js 
app.get("/payment/success", esewa.processPaymentSuccess, async (req, res) => {
  try {
    const { transaction_uuid, amount, ...otherFields } = req.params; // Use req.params for GET parameters 

    console.log(transaction_uuid)
    console.log(amount)

    // Prepare the redirect URL and optional message properties
    const redirectUrl = "http://your_domain.com/success"; 
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

app.get("/payment/failure", esewa.processPaymentFailure, async (req, res) => {
  try {
    const redirectUrl = "http://your_domain.com/failure"; // set at url page you want your clent to get when payment fails
    const messageProps = {
      paymentFailed: "Oops!",
      sorry: "Sorry, your payment failed.",
    };
    // Retrieve the transaction UUID from the request object it is set by esewa.processPaymentFailure middleware
    console.log(req.transactionUUID)
    // Redirect the client to the specified URL with message properties

    esewa.redirectToClientSite(res, redirectUrl, messageProps);
  } catch (error) {
    console.error("Error handling payment failure:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

```
# Additional Notes

Details of Methods Initialization Class
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
esewa.initiatePayment(); //sends an html file to the client that  self submits to esewa but on some frontend frame works you may have to manually open the html file 

```
# Important Considerations

Make sure to implement appropriate error handling.
Update the success and failure URLs as needed for your production environment.
Consider implementing logging for better traceability of issues.

# License

This package is licensed under the MIT License.
About


