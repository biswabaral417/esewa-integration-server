const createSignature = require('./createSignature');

class EsewaIntegration {
    constructor({ secretKey, productCode, successUrl, failureUrl }) {
        if (!secretKey || !productCode) {
            throw new Error("Secret key and product code are required.");
        }
        this.secretKey = secretKey;
        this.successUrl = successUrl || "http://localhost:9000/api/esewaPayment/success";
        this.failureUrl = failureUrl || "http://localhost:9000/api/esewaPayment/failure";
    }
    /**
     * Initiates payment by generating an auto-submitting form and sending it to the frontend.
     * @param {Object} orderDetails - An object containing the order details.
     * @param {Object} res - The response object.
     */
    initiatePayment({ total_amount, amount, transactionUUID, productDeliveryCharge = 0, productServiceCharge = 0, taxAmount = 0, productCode = 'EPAYTEST' }, res) {
        try {
            if (!amount || !transactionUUID || !total_amount) {
                throw new Error("Amount and Transaction UUID are required.");
            }

            // Create the message with selected fields
            const message = `transaction_uuid=${transactionUUID},product_code=${productCode},total_amount=${total_amount}`;
            const signature = createSignature(this.secretKey, message);

            // Create the HTML form with auto-submit
            let formHtml = `
                <html>
                <body onload="document.forms['esewaForm'].submit()">
                    <form id="esewaForm" action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
                        <input type="hidden" name="amount" value="${amount}" />
                        <input type="hidden" name="product_delivery_charge" value="${productDeliveryCharge}" />
                        <input type="hidden" name="product_service_charge" value="${productServiceCharge}" />
                        <input type="hidden" name="product_code" value="${this.productCode}" />
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
}

module.exports = EsewaIntegration;
