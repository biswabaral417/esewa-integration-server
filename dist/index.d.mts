import { Response, Request, NextFunction } from 'express';

// ./Types/index.ts
// this is  esewa options but secret key is required but if user does not provide it then we will use default secret key
interface EsewaIntegrationOptions {
    secretKey?: string;
    successUrl?: string;
    failureUrl?: string;
    secure?: boolean;
    sameSite?: boolean | "strict" | "lax" | "none";
}




// to initiate payment we need these parameters 

interface InitiatePaymentParams {
  total_amount: number;
  amount: number;
  transactionUUID: string;
  productDeliveryCharge?: number;
  productServiceCharge?: number;
  taxAmount?: number;
  productCode?: string;
  responseType?: "html" | "json"; // NEW
}







// types for transaction status
interface TransactionStatusParams {
  product_code: string;
  transaction_uuid: string;
  total_amount: number;
  isProduction?: boolean; // toggle between test and prod
}

interface TransactionStatusResponse {
  product_code: string;
  transaction_uuid: string;
  total_amount: number;
  status: string;
  ref_id: string | null;
}

declare class EsewaIntegration {
    private secretKey;
    private successUrl;
    private failureUrl;
    private secure;
    private sameSite;
    constructor(options: EsewaIntegrationOptions);
    initiatePayment(params: InitiatePaymentParams & {
        responseType?: "html" | "json";
    }, res: Response): void;
    redirectToClientSite(res: Response, redirectURL: string, messageProps?: Record<string, string>): void;
    processPaymentSuccess(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
    processPaymentFailure(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
    static getTransactionStatus(params: TransactionStatusParams): Promise<TransactionStatusResponse>;
}

export { EsewaIntegration as default };
