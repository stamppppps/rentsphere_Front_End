import { useState } from "react";

export function useBankAccountForm() {
  const [bank, setBank] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");

  const setAccountNoSafe = (value: string) => {
  
    const clean = value.replace(/\D/g, "");
    setAccountNo(clean);
  };

  const reset = () => {
    setBank("");
    setAccountNo("");
    setAccountName("");
  };

  const isValid =
    bank.trim() !== "" &&
    accountName.trim().length >= 3 &&
    accountNo.length >= 8;

  return {
    bank,
    setBank,
    accountNo,
    setAccountNo: setAccountNoSafe,
    accountName,
    setAccountName,
    reset,
    isValid,
  };
}