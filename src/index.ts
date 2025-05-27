// src/EsewaIntegration.ts
import { Request, Response, NextFunction } from "express";
import processPaymentFailure from "./processPayments/processPaymentFailure";
import processPaymentSuccess from "./processPayments/processPaymentSuccess";

import {
    InitiatePaymentParams,
    EsewaIntegrationOptions,
    ResolvedEsewaOptions,
    TransactionStatusParams,
    TransactionStatusResponse,
} from "./Types/index";

import { initiatePayment as init } from "./initiatePayment";
import { checkTransactionStatus } from "./checkStatus";

class EsewaIntegration {
    private secretKey: string;
    private successUrl: string;
    private failureUrl: string;
    private secure: boolean;
    private sameSite: boolean | "strict" | "lax" | "none";

    constructor(options: EsewaIntegrationOptions) {
        const resolvedOptions: ResolvedEsewaOptions = {
            secretKey: options.secretKey ?? "8gBm/:&EnhH.1/q",
            successUrl:
                options.successUrl ??
                "http://localhost:9000/api/esewaPayment/success",
            failureUrl:
                options.failureUrl ??
                "http://localhost:9000/api/esewaPayment/failure",
            secure: !!options.secure,
            sameSite: options.sameSite ?? "lax",
        };

        this.secretKey = resolvedOptions.secretKey;
        this.successUrl = resolvedOptions.successUrl;
        this.failureUrl = resolvedOptions.failureUrl;
        this.secure = resolvedOptions.secure;
        this.sameSite = resolvedOptions.sameSite;

        this.processPaymentSuccess = this.processPaymentSuccess.bind(this);
    }

    initiatePayment(
        params: InitiatePaymentParams & { responseType?: "html" | "json" },
        res: Response
    ): void {
        init(params, {
            secretKey: this.secretKey,
            successUrl: this.successUrl,
            failureUrl: this.failureUrl,
            secure: this.secure,
            sameSite: this.sameSite,
        }, res);
    }


    redirectToClientSite(
        res: Response,
        redirectURL: string,
        messageProps: Record<string, string> = {}
    ): void {
        const queryParams = new URLSearchParams(messageProps).toString();
        const redirectUrl = `${redirectURL}?${queryParams}`;
        res.redirect(redirectUrl);
    }


    processPaymentSuccess(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void | Response<any, Record<string, any>>> {
        return processPaymentSuccess(req, res, next, this.secretKey);
    }


    processPaymentFailure(
        req: Request,
        res: Response,
        next: NextFunction
    ): void | Response<any, Record<string, any>> {
        return processPaymentFailure(req, res, next);
    }


    static async getTransactionStatus(
        params: TransactionStatusParams
    ): Promise<TransactionStatusResponse> {
        return checkTransactionStatus(params);
    }
}

export default EsewaIntegration;
