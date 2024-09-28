const createSignature = require('./createSignature');
const processPaymentFailure = require('./processPaymentFailure');
const processPaymentSuccess = require('./processPaymentSuccess');

class EsewaIntegration {
    constructor({ secretKey, successUrl, failureUrl, secure, sameSite }) {
        if (!secretKey) {
            throw new Error("Secret key is required.");
        }
        this.secretKey = secretKey;
        this.successUrl = successUrl || "http://localhost:9000/api/esewaPayment/success";
        this.failureUrl = failureUrl || "http://localhost:9000/api/esewaPayment/failure";
        this.secure = secure === 'true'; // Ensure this is a boolean
        this.sameSite = sameSite || 'lax'; // Default to 'lax'
        this.processPaymentSuccess = this.processPaymentSuccess.bind(this);
    }

    initiatePayment({
        total_amount,
        amount,
        transactionUUID,
        productDeliveryCharge = 0,
        productServiceCharge = 0,
        taxAmount = 0,
        productCode = 'EPAYTEST'
    }, res) {
        try {
            if (!transactionUUID || !total_amount || !amount) {
                throw new Error("amount, total_amount, and Transaction UUID are required.");
            }

            res.clearCookie('transaction_uuid', { path: '/' }); // Clear previous cookie

            const message = `transaction_uuid=${transactionUUID},product_code=${productCode},total_amount=${total_amount}`;
            const signature = createSignature(this.secretKey, message);

            res.cookie('transaction_uuid', transactionUUID, {
                maxAge: 30000, // 30 seconds for testing
                httpOnly: true,
                secure: this.secure,
                sameSite: this.sameSite
            });

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

            res.status(200).send(formHtml);
        } catch (error) {
            console.error('Error initiating payment:', error);
            res.status(500).send({ error: 'Failed to initiate payment.', message: error.message });
        }
    }

    redirectToClientSite(res, redirectURL, messageProps = {}) {
        const queryParams = new URLSearchParams(messageProps).toString();
        const redirectUrl = `${redirectURL}?${queryParams}`;
        res.sendStatus(200).redirect(redirectUrl);
    }

    processPaymentSuccess(req, res, next) {
        return processPaymentSuccess(req, res, next, this.secretKey);
    }

    processPaymentFailure(req, res, next) {
        return processPaymentFailure(req, res, next);
    }
}

module.exports = EsewaIntegration;
