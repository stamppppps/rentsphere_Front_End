import { useState } from "react";

export function useBankAccountForm() {
  const [bank, setBank] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");

  const reset = () => {
    setBank("");
    setAccountNo("");
    setAccountName("");
  };

  return {
    bank,
    setBank,
    accountNo,
    setAccountNo,
    accountName,
    setAccountName,
    reset,
  };
}