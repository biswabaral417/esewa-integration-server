# usage example: 
    const EsewaIntegration = require('esewa-integration-package');

# // Initialize with custom configuration
    const esewa = new EsewaIntegration({
    secretKey: 'your-esewa-secret-key',
    productCode: 'EPAYTEST',
    successUrl: 'https://yourdomain.com/payment/success',
    failureUrl: 'https://yourdomain.com/payment/failure'
    });

# // Pass the order details dynamically
    const orderDetails = {
    amount: 1000,
    transactionUUID: 'some-unique-transaction-id'
    };

# // Optional fields can also be passed
    const formData = esewa.createPaymentFormData(orderDetails, {
    productDeliveryCharge: 50,
    productServiceCharge: 30,
    taxAmount: 10
    });

# // Log the generated formData for integration
    console.log(formData);

# // Example of verifying payment signature after successful payment
    try {
    const paymentData = { /* payment data from eSewa */ };
    esewa.verifyPaymentSignature(paymentData);
    console.log('Payment verification successful');
    } catch (error) {
    console.error('Payment verification failed:', error.message);
    }
