// src/initiatePayment.ts
import { Response } from "express";
import {  InitiatePaymentParams, ResolvedEsewaOptions } from "./Types/index";
import { createSignature } from "./utils/createSignatute";

export const initiatePayment = (
    {
        total_amount,
        amount,
        transactionUUID,
        productDeliveryCharge = 0,
        productServiceCharge = 0,
        taxAmount = 0,
        productCode = "EPAYTEST",
        responseType = "html",
    }: InitiatePaymentParams,
    esewaOptions: ResolvedEsewaOptions,
    res: Response
): void | Response => {
    try {
        if (!transactionUUID || !total_amount || !amount) {
            throw new Error(
                "amount, total_amount, and Transaction UUID are required."
            );
        }

        res.clearCookie("transaction_uuid", { path: "/" });

        const message = `transaction_uuid=${transactionUUID},product_code=${productCode},total_amount=${total_amount}`;
        const signature = createSignature(esewaOptions.secretKey, message);

        res.cookie("transaction_uuid", transactionUUID, {
            maxAge: 30000,
            httpOnly: true,
            secure: esewaOptions.secure,
            sameSite: esewaOptions.sameSite,
        });

        const formFields = {
            amount,
            product_delivery_charge: productDeliveryCharge,
            product_service_charge: productServiceCharge,
            product_code: productCode,
            signature,
            signed_field_names: "transaction_uuid,product_code,total_amount",
            failure_url: esewaOptions.failureUrl,
            success_url: esewaOptions.successUrl,
            tax_amount: taxAmount,
            total_amount,
            transaction_uuid: transactionUUID,
        };

        if (responseType === "json") {
            return res.status(200).json({
                formAction:
                    "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
                formMethod: "POST",
                formFields,
            });
        }

        const formHtml = `
      <html>
      <body onload="document.forms['esewaForm'].submit()">
          <form id="esewaForm" action="https://rc-epay.esewa.com.np/api/epay/main/v2/form" method="POST">
              ${Object.entries(formFields)
                .map(
                    ([key, value]) =>
                        `<input type="hidden" name="${key}" value="${value}" />`
                )
                .join("\n")}
          </form>
      </body>
      </html>
    `;

        res.status(200).send(formHtml);
    } catch (error: any) {
        console.error("Error initiating payment:", error);
        res.status(500).send({
            error: "Failed to initiate payment.",
            message: error.message,
        });
    }
};
