### esewa Integration Server

# Node.js / Express middleware and utilities for integrating with the eSewa payment gateway, supporting signature verification, payment initiation, success/failure handling, and transaction status checks.
# Features

    Initiate eSewa payments with customizable amounts, taxes, and charges.

    Handles payment callbacks, verifies HMAC SHA256 signatures, checks transaction status for test and production, supports JSON and HTML responses, provides TypeScript typings, flexible config, and user redirection with query parameters.

## Installation
```bash
npm install esewa-integration-server
```
## Usage
 # Basic Setup
 esm 
```js
      import express from "express";
      import EsewaIntegration from "esewa-integration-server";

      const app = express();

      const esewa = new EsewaIntegration({
        secretKey: "your-esewa-secret-key",
        successUrl: "https://yourdomain.com/payment-success",
        failureUrl: "https://yourdomain.com/payment-failure",
        secure: true,
        sameSite: "lax",
      });
```
  cjs
```js
      import express from "express";
      import EsewaIntegration from "esewa-integration-server";

      const app = express();

      const esewa = new EsewaIntegration({
        secretKey: "your-esewa-secret-key",
        successUrl: "https://yourdomain.com/payment-success",
        failureUrl: "https://yourdomain.com/payment-failure",
        secure: true,
        sameSite: "lax",
      });
```

  # Initiate Payment
```js

      app.post("/start-payment", (req, res) => {
        esewa.initiatePayment(
          {
            total_amount: 1050,
            amount: 1000,
            transactionUUID: "unique-transaction-id-123",
            productDeliveryCharge: 30,
            productServiceCharge: 20,
            taxAmount: 0,
            productCode: "EPAYTEST",
            responseType: "html", // or "json"
          },
          res
        );
      });
```

# Handle Payment Success Middleware
```js
    app.get("/payment-success", (req, res, next) => {
      esewa.processPaymentSuccess(req, res, next);
    }, (req, res) => {
      // Access decoded payment params in req.params here
      //console.log(req.params)
      res.send("Payment successful!");
    });
```
# Handle Payment Failure Middleware
```js
app.get("/payment-failure", (req, res, next) => {
  esewa.processPaymentFailure(req, res, next);

}, (req, res) => {
  //u can use req.transactionUUID to get the transaction uuid
  //console.log(req.transactionUUID)
  res.send("Payment failed or cancelled.");
});
```
# Check Transaction Status (Async)
```js
const status = await EsewaIntegration.getTransactionStatus({
  product_code: "EPAYTEST",
  transaction_uuid: "unique-transaction-id-123",
  total_amount: 1050,
  isProduction: false,
});

console.log("Transaction status:", status.status);
```
# Redirect with Custom Query Params
```js
app.get("/redirect-user", (req, res) => {
  esewa.redirectToClientSite(res, "https://yourapp.com/result", {
    status: "success",
    orderId: "12345",
  });
});
```

# Options
## Configuration Options

| **Field**         | **Type**                 | **Required** | **Description**                                 |
| ----------------- | ------------------------ | ------------ | ----------------------------------------------- |
| `merchantCode`    | `string`                 | Yes          | Your eSewa merchant code.                       |
| `successURL`      | `string`                 | Yes          | URL to redirect after a successful transaction. |
| `failureURL`      | `string`                 | Yes          | URL to redirect after a failed transaction.     |
| `environment`     | `'test' \| 'production'` | No           | Defaults to `'test'`.                           |
| `secretKey`       | `string`                 | Yes          | Used for secure HMAC signature verification.    |
| `baseRedirectURL` | `string`                 | No           | Optional: Base client URL for redirection.      |

    Option	Type	Default	Description
    secretKey	string	"8gBm/:&EnhH.1/q"	eSewa secret key for signing
    successUrl	string	http://localhost:9000/api/esewaPayment/success	Callback URL on payment success
    failureUrl	string	http://localhost:9000/api/esewaPayment/failure	Callback URL on payment failure
    secure	boolean	false	Use secure cookies
    sameSite	`boolean	"strict"	"lax"
    Initiate Payment Params
    Param	Type	Required	Description
    total_amount	number	Yes	Total amount including taxes and charges
    amount	number	Yes	Base amount (product price)
    transactionUUID	string	Yes	Unique transaction identifier
    productDeliveryCharge	number	No	Optional delivery charge
    productServiceCharge	number	No	Optional service charge
    taxAmount	number	No	Optional tax amount
    productCode	string	No	Product code (default: "EPAYTEST")
    responseType	`"html"	"json"`	No
    Error Handling

All middleware catch and return appropriate HTTP errors with JSON messages if unexpected errors occur during processing.
Contributing


# MORE DETAILS
# TYPE DEFs

| **Type Name**              | **Field**         | **Type**                                  | **Description**                                           |
| -------------------------- | ----------------- | ----------------------------------------- | --------------------------------------------------------- |
| `EsewaConfig`              | `merchantCode`    | `string`                                  | Your merchant code provided by eSewa.                     |
|                            | `successURL`      | `string`                                  | Callback URL on successful payment.                       |
|                            | `failureURL`      | `string`                                  | Callback URL on failed payment.                           |
|                            | `environment`     | `'test' \| 'production'` (optional)       | Environment setting; defaults to `'test'`.                |
|                            | `secretKey`       | `string`                                  | Secret key for signature verification.                    |
|                            | `baseRedirectURL` | `string` (optional)                       | Optional client redirect base URL after payment.          |
| `EsewaCallbackQuery`       | `amt`             | `string`                                  | Amount involved in the transaction.                       |
|                            | `pid`             | `string`                                  | Product ID of the transaction.                            |
|                            | `rid`             | `string`                                  | Reference ID returned by eSewa.                           |
|                            | `scd`             | `string`                                  | Merchant code used during transaction.                    |
|                            | `su`              | `string` (optional)                       | Optional override for success redirect.                   |
|                            | `fu`              | `string` (optional)                       | Optional override for failure redirect.                   |
| `EsewaStatusResponse`      | `status`          | `'Success' \| 'Failure' \| 'Pending'`     | Status of the transaction after verification.             |
|                            | `referenceId`     | `string`                                  | Unique reference ID from eSewa.                           |
|                            | `productId`       | `string`                                  | Product ID of the original transaction.                   |
|                            | `amount`          | `number`                                  | Amount paid in the transaction.                           |
|                            | `message`         | `string` (optional)                       | Optional message or error detail.                         |
| `RedirectOptions`          | `siteName`        | `string`                                  | Base site name for redirection.                           |
|                            | `messageProps`    | `Record<string, string \| number>`        | Object of message props passed as query parameters.       |
|                            | `res`             | `express.Response`                        | Express response object for handling redirection.         |
| `SignaturePayload`         | `amt`             | `string`                                  | Amount.                                                   |
|                            | `pid`             | `string`                                  | Product ID.                                               |
|                            | `scd`             | `string`                                  | Merchant code.                                            |
|                            | `rid`             | `string`                                  | Reference ID.                                             |
|                            | `secretKey`       | `string`                                  | Secret key used to compute HMAC.                          |
| `PaymentInitiationOptions` | `amount`          | `number`                                  | Amount to be paid.                                        |
|                            | `productId`       | `string`                                  | Product ID.                                               |
|                            | `merchantCode`    | `string`                                  | Merchant code.                                            |
|                            | `successURL`      | `string`                                  | Success redirect URL.                                     |
|                            | `failureURL`      | `string`                                  | Failure redirect URL.                                     |
|                            | `responseType`    | `'json' \| 'form'` (optional)             | Format of the response. Defaults to `'form'`.             |
| `EsewaMiddlewareHandler`   | —                 | `Function(req, res, next): void`          | Standard Express middleware for handling eSewa callbacks. |
| `PaymentSuccessHandler`    | —                 | `Function(query, status, req, res): void` | Called when payment succeeds.                             |
| `PaymentFailureHandler`    | —                 | `Function(query, req, res): void`         | Called when payment fails.                                |
| `GeneratePaymentForm`      | —                 | `Function(options): string \| object`     | Generates HTML form or JSON for payment initiation.       |
| `VerifySignature`          | —                 | `Function(payload, signature): boolean`   | Validates the HMAC-SHA256 signature received from eSewa.  |



Feel free to open issues or PRs for bugs, feature requests, or improvements!
# License

MIT License
