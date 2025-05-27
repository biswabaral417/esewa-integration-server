import { TransactionStatusParams,TransactionStatusResponse } from "./Types";
export async function checkTransactionStatus({
  product_code,
  transaction_uuid,
  total_amount,
  isProduction = false,
}: TransactionStatusParams): Promise<TransactionStatusResponse> {
  const baseUrl = isProduction
    ? "https://epay.esewa.com.np"
    : "https://rc.esewa.com.np";

  const url = new URL(`${baseUrl}/api/epay/transaction/status/`);
  url.searchParams.set("product_code", product_code);
  url.searchParams.set("transaction_uuid", transaction_uuid);
  url.searchParams.set("total_amount", total_amount.toString());

  const res = await fetch(url.toString());

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Failed to fetch transaction status: ${res.status} - ${res.statusText}\n${errorBody}`
    );
  }

  const data = await res.json();
  return data as TransactionStatusResponse;
}