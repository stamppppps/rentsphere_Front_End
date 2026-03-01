export type BankOption = {
    code: string;
    label: string;
};

export const BANK_OPTIONS: BankOption[] = [
    { code: "PROMPTPAY", label: "พร้อมเพย์ (PromptPay)" },
    { code: "BBL", label: "กรุงเทพ (Bangkok Bank)" },
    { code: "KBANK", label: "กสิกรไทย (Kasikorn)" },
    { code: "KTB", label: "กรุงไทย (Krungthai)" },
    { code: "SCB", label: "ไทยพาณิชย์ (SCB)" },
    { code: "BAY", label: "กรุงศรีอยุธยา (Krungsri)" },
    { code: "TMBTTB", label: "ทหารไทยธนชาต (TTB)" },
    { code: "GSB", label: "ออมสิน" },
    { code: "BAAC", label: "ธ.ก.ส. (BAAC)" },
    { code: "CIMB", label: "ซีไอเอ็มบีไทย (CIMB Thai)" },
    { code: "UOB", label: "ยูโอบี (UOB)" },
    { code: "KKP", label: "เกียรตินาคินภัทร (KKP)" },
    { code: "TISCO", label: "ทิสโก้ (Tisco)" },
    { code: "LHFG", label: "แลนด์ แอนด์ เฮ้าส์ (LH Bank)" },
    { code: "ICBC", label: "ไอซีบีซี (ICBC Thai)" },
    { code: "IBANK", label: "อิสลามแห่งประเทศไทย (iBank)" },
    { code: "EXIM", label: "เพื่อการส่งออกและนำเข้า (EXIM)" },
    { code: "GHB", label: "อาคารสงเคราะห์ (GHB)" },
];