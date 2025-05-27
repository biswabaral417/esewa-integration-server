import { Request, Response, NextFunction } from "express";
import verifyPaymentSignature from "../utils/verifyPaymentSignature";
import decodeHash from "../utils/decodeHash";

interface ProcessPaymentSuccessRequest extends Request {
  params: Record<string, any>;
  query: {
    data?: string;
  };
}

const processPaymentSuccess = async (
  req: ProcessPaymentSuccessRequest,
  res: Response,
  next: NextFunction,
  secretKey: string
): Promise<Response | void> => {
  try {
    if (!req.query.data) {
      return res.status(400).json({ error: "Missing data query parameter." });
    }

    const decodedHash = decodeHash(req.query.data);
    res.clearCookie("transaction_uuid");

    const isSignatureValid = verifyPaymentSignature(decodedHash, secretKey);
    if (!isSignatureValid) {
      return res.status(400).json({ error: "Invalid payment signature." });
    }

    req.params = decodedHash;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: "An unknown error occurred." });
  }
};

export default processPaymentSuccess;
