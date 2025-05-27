import { NextFunction, Response } from "express";
import { paymentMiddlewaresTypes } from "../Types";

const processPaymentFailure = (
  req: paymentMiddlewaresTypes,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const transactionUUID = req.cookies.transaction_uuid;
    if (transactionUUID) {
      req.transactionUUID = transactionUUID; // Attach to req if needed elsewhere
      res.clearCookie("transaction_uuid");
    }
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred." });
  }
};

export default processPaymentFailure;
