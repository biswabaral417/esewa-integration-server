import { Response, Request } from "express";

// ./Types/index.ts
// this is  esewa options but secret key is required but if user does not provide it then we will use default secret key
export interface EsewaIntegrationOptions {
    secretKey?: string;
    successUrl?: string;
    failureUrl?: string;
    secure?: boolean;
    sameSite?: boolean | "strict" | "lax" | "none";
}
// this is resolved esewa options 
export interface ResolvedEsewaOptions {
    secretKey: string;
    successUrl: string;
    failureUrl: string;
    secure: boolean;
    sameSite: boolean | "strict" | "lax" | "none";
}




// to initiate payment we need these parameters 

export interface InitiatePaymentParams {
  total_amount: number;
  amount: number;
  transactionUUID: string;
  productDeliveryCharge?: number;
  productServiceCharge?: number;
  taxAmount?: number;
  productCode?: string;
  responseType?: "html" | "json"; // NEW
}



export interface createSignatureFunctionType {
  (secretKey: string, message: string): string;
}



export interface paymentMiddlewaresTypes extends Request {
  transactionUUID?: string;
}



export interface PaymentData {
  signed_field_names?: string;
  signature?: string;
  [key: string]: any; // Allow other fields with string keys and any values
}







// types for transaction status
export interface TransactionStatusParams {
  product_code: string;
  transaction_uuid: string;
  total_amount: number;
  isProduction?: boolean; // toggle between test and prod
}

export interface TransactionStatusResponse {
  product_code: string;
  transaction_uuid: string;
  total_amount: number;
  status: string;
  ref_id: string | null;
}
