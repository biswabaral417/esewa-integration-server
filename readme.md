## esewa-integration-server

# A flexible Node package for integrating with the eSewa payment gateway. Easily handle payment initiation, success, and failure notifications in your Express app.

# Features

   Simple eSewa payment initiation with HTML form redirect

    Middleware to process payment success and failure callbacks

    Automatic client redirection with customizable messages

    Supports Node.js & Express with TypeScript typings
    

# Installation

```bash
  npm install esewa-integration-server
```

# Quick Start
 Initialize the Integration
```js

const EsewaIntegration = require("esewa-integration-server");

const esewa = new EsewaIntegration({
  secretKey: process.env.ESEWA_SECRET_KEY || "your-esewa-secret-key",
  successUrl: "https://yourdomain.com/payment/success",
  failureUrl: "https://yourdomain.com/payment/failure",

  // Optional cookie settings for tracking payment failures
  sameSite: "strict",
  secure: true,
});
```
Initiate Payment
```js
app.get("/esewa/initiate", async (req, res) => {
  const { total_amount } = req.query;
  const transactionUUID = generateUniqueUUID(); // your UUID generator function

  esewa.initiatePayment(
    {
      total_amount,
      transactionUUID,
      amount: total_amount,
      productCode: "EPAYTEST", // optional
      // productDeliveryCharge: 0,
      // productServiceCharge: 0,
      // taxAmount: 0,
    },
    res
  );
});
```
Frontend Example (React)

If using React or another frontend framework, you can render the HTML response from the initiate endpoint directly to redirect the user:
```js
import React, { useState } from "react";

export default function Payment() {
  const [amount, setAmount] = useState("");

  async function initiatePayment(e) {
    e.preventDefault();

    try {
      const response = await fetch(`/esewa/initiate?total_amount=${amount}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to initiate payment");

      const html = await response.text();
      document.open();
      document.write(html);
      document.close();
    } catch (error) {
      console.error("Payment initiation error:", error);
    }
  }

  return (
    <form onSubmit={initiatePayment}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        required
      />
      <button type="submit">Pay with eSewa</button>
    </form>
  );
}
```
Handle Payment Success
```js
app.get("/payment/success", esewa.processPaymentSuccess, (req, res) => {
  const { transaction_uuid, amount } = req.params;

  console.log("Payment succeeded:", transaction_uuid, amount);

  const redirectUrl = "https://yourdomain.com/success";
  const messageProps = {
    paymentSuccess: "Payment successful!",
    thanks: "Thank you for your order!",
  };

  esewa.redirectToClientSite(res, redirectUrl, messageProps);
});
```
Handle Payment Failure
```js

app.get("/payment/failure", esewa.processPaymentFailure, (req, res) => {
  const { transactionUUID } = req; // set by middleware

  console.log("Payment failed for transaction:", transactionUUID);

  const redirectUrl = "https://yourdomain.com/failure";
  const messageProps = {
    paymentFailed: "Payment failed.",
    sorry: "Sorry, your payment could not be processed.",
  };

  esewa.redirectToClientSite(res, redirectUrl, messageProps);
});
```
# API Reference
# Method	Description

  new EsewaIntegration(opts)	Create a new instance with config options
  esewa.initiatePayment(paymentDetails, res)	Initiates payment and sends HTML form redirect
  esewa.processPaymentSuccess	Express middleware to handle success callback
  esewa.processPaymentFailure	Express middleware to handle failure callback
  esewa.redirectToClientSite(res, url, messageProps)	Redirects to client URL with optional message data
  
Configuration Options

    secretKey (string, required): Your eSewa secret key.

    successUrl (string, required): URL to handle successful payment callbacks.

    failureUrl (string, required): URL to handle failed payment callbacks.

    sameSite (string, optional): Cookie SameSite attribute (e.g., "strict").

    secure (boolean, optional): Cookie Secure attribute (true or false).

# Get Your Secret Key for prod from esewa,   secret key for dev is already included

# Notes

    Make sure to implement proper error handling in your routes.

    Update success and failure URLs for production environment.

    This package uses cookies to track payment state on failure for better UX.

    You can extend and customize middleware handlers as needed.

# License

#MIT License © Biswa Baral