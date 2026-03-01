export const BANK_OPTIONS = [
  { code: "PROMPTPAY", label: "พร้อมเพย์ (PromptPay)" },

  { code: "BBL", label: "ธนาคารกรุงเทพ (Bangkok Bank)" },
  { code: "KBANK", label: "ธนาคารกสิกรไทย (Kasikorn Bank)" },
  { code: "SCB", label: "ธนาคารไทยพาณิชย์ (SCB)" },
  { code: "KTB", label: "ธนาคารกรุงไทย (Krungthai Bank)" },
  { code: "BAY", label: "ธนาคารกรุงศรีอยุธยา (Krungsri Bank)" },
  { code: "TTB", label: "ธนาคารทหารไทยธนชาต (TTB)" },

  { code: "GSB", label: "ธนาคารออมสิน (GSB)" },
  { code: "BAAC", label: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)" },
  { code: "GHB", label: "ธนาคารอาคารสงเคราะห์ (GHB)" },

  { code: "CIMB", label: "ธนาคารซีไอเอ็มบีไทย (CIMB Thai)" },
  { code: "UOB", label: "ธนาคารยูโอบี (UOB)" },
  { code: "KKP", label: "ธนาคารเกียรตินาคินภัทร (KKP)" },
  { code: "TISCO", label: "ธนาคารทิสโก้ (TISCO)" },
  { code: "LH", label: "ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)" },
  { code: "ICBC", label: "ธนาคารไอซีบีซี (ICBC Thai)" },

  { code: "EXIM", label: "ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย (EXIM)" },
  { code: "IBANK", label: "ธนาคารอิสลามแห่งประเทศไทย (IBank)" }
] as const;

export type BankCode = typeof BANK_OPTIONS[number]["code"];