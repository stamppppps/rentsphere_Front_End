// BankAccountForm.tsx
import { useState } from "react";

export function useBankAccountForm() {
  const [bank, setBank] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [price, setPrice] = useState("");

  const reset = () => {
    setBank("");
    setAccountNo("");
    setPrice("");
  };

  return {
    bank,
    setBank,
    accountNo,
    setAccountNo,
    price,
    setPrice,
    reset,
  };
}
