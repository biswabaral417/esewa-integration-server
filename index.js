const createSignature = require('./createSignature');
const processPaymentSuccess = require('./processPaymentSucess');

class EsewaIntegration {
    constructor({ secretKey, successUrl, failureUrl }) {
        if (!secretKey) {
            throw new Error("Secret key is required.");
        }
        this.secretKey = secretKey;
        this.successUrl = successUrl || "http://localhost:9000/api/esewaPayment/success";
        this.failureUrl = failureUrl || "http://localhost:9000/api/esewaPayment/failure";
        this.processPaymentSuccess = this.processPaymentSuccess.bind(this);
    }
    /**
      Initiates payment by generating an auto-submitting form and sending it to the frontend.
     * @param {Object} orderDetails - An object containing the order details.
     * @param {Object} res - The response object.
     */
      initiatePayment({ 
        total_amount, 
        amount = 0, 
        transactionUUID, 
        productDeliveryCharge = 0, 
        productServiceCharge = 0, 
        taxAmount = 0, 
        productCode = 'EPAYTEST' 
    }, res) {
        try {
            if (!transactionUUID || !total_amount) {
                throw new Error("Amount and Transaction UUID are required.");
            }
            res.clearCookie('transaction_uuid');
            //clear this cookie as user initiates new payment 
    
            // Create the message with selected fields
            const message = `transaction_uuid=${transactionUUID},product_code=${productCode},total_amount=${total_amount}`;
            const signature = createSignature(this.secretKey, message);
    
            // Set the transaction_uuid cookie with a max age of 15 minutes (900000 milliseconds)

            res.cookie('transaction_uuid', transactionUUID, {
                maxAge: 30000, // 15 minutes in milliseconds
                httpOnly: true, // Ensures the cookie is not accessible via client-side JavaScript
                secure: process.env.NODE_ENV === 'production', // Ensure the cookie is only sent over HTTPS in production
                sameSite: 'Strict' // Protects against CSRF attacks by not sending the cookie with cross-site requests
            });
    
            // Create the HTML form with auto-submit
            let formHtml = `
                <html>
                <body onload="document.forms['esewaForm'].submit()">
                    <form id="esewaForm" action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
                        <input type="hidden" name="amount" value="${amount}" />
                        <input type="hidden" name="product_delivery_charge" value="${productDeliveryCharge}" />
                        <input type="hidden" name="product_service_charge" value="${productServiceCharge}" />
                        <input type="hidden" name="product_code" value="${productCode}" />
                        <input type="hidden" name="signature" value="${signature}" />
                        <input type="hidden" name="signed_field_names" value="transaction_uuid,product_code,total_amount" />
                        <input type="hidden" name="failure_url" value="${this.failureUrl}" />
                        <input type="hidden" name="success_url" value="${this.successUrl}" />
                        <input type="hidden" name="tax_amount" value="${taxAmount}" />
                        <input type="hidden" name="total_amount" value="${total_amount}" />
                        <input type="hidden" name="transaction_uuid" value="${transactionUUID}" />
                    </form>
                </body>
                </html>
            `;
    
            // Send the form as the response
            res.status(200).send(formHtml);
        } catch (error) {
            console.error('Error initiating payment:', error);
            res.status(500).send('Failed to initiate payment.');
        }
    }
    
    /**
    * Redirects the user to the client site after successful payment.
    * @param {Object} res - The response object.
    * @param {String} siteName - The domain name where the user should be redirected.
    * @param {Object} messageProps - The message or data to be sent to the user.
    */
    redirectToClientSite(res, redirectURL, messageProps = {}) {
        const queryParams = new URLSearchParams(messageProps).toString();
        const redirectUrl = `${redirectURL}?${queryParams}`;
        res.redirect(redirectUrl);
    }

    processPaymentSuccess(req, res, next) {
        return processPaymentSuccess(req, res, next, this.secretKey);
    }
}

module.exports = EsewaIntegration;

