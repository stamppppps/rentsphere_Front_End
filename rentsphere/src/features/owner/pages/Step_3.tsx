import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* hook (logic อย่างเดียว) */
import { useBankAccountForm } from "./AddCondo/components/BankAccountForm";

/* list component */
import BankAccountList from "./AddCondo/components/BankAccountList";

export default function Step_3() {
  const nav = useNavigate();

  /* ===== form logic ===== */
  const form = useBankAccountForm();

  const isFormValid =
    form.bank.trim() !== "" &&
    form.accountNo.trim() !== "" &&
    form.price.trim() !== "";


  /*===== animation save ===8*/
  const [showSaved, setShowSaved] = useState(false);

  /* ===== accounts state ===== */
  const [accounts, setAccounts] = useState([] as {
    id: number;
    bank: string;
    accountNo: string;
    price: string;
  }[]);

  /* ===== handlers ===== */
  const handleAddAccount = () => {
    if (!form.bank || !form.accountNo || !form.price) return;
    if (!isFormValid) return;
    setAccounts((prev) => [
      ...prev,
      {
        id: Date.now(),
        bank: form.bank,
        accountNo: form.accountNo,
        price: form.price,
      },
    ]);

    form.reset();
  };

  const handleDeleteAccount = (id: number) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div style={styles.content}>

      {/* ===== success message ใต้แถบม่วง ===== */}
      {showSaved && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              background: "#DCFCE7",
              color: "#166534",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 12,
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              whiteSpace: "nowrap",
            }}
          >
            ✓ บันทึกข้อความสำเร็จ
          </div>
        </div>
      )}

      {/* ===== Title ===== */}
      <h1 style={styles.title}>ตั้งค่าคอนโดมิเนียม</h1>

      <div style={styles.centerCol}>
        {/* ===== Card: คำอธิบาย ===== */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>บัญชีธนาคาร</h3>
          <ul style={styles.list}>
            <li>
              รายการบัญชีธนาคาร: รายชื่อธนาคารที่ใช้รับเงิน
              ซึ่งจะแสดงในใบแจ้งหนี้
            </li>
            <li>คำแนะนำควรระบุไม่เกิน 2 รายชื่อธนาคาร</li>
          </ul>
        </div>

        {/* ===== Card: เพิ่มบัญชี (UI เดิม 100%) ===== */}
        <div style={{ ...styles.card, border: "2px solid #60A5FA" }}>
          <div style={styles.formRow}>
            <div style={styles.field}>
              <label>
                ธนาคาร <span style={styles.required}>*</span>
              </label>
              <select
                style={styles.input}
                value={form.bank}
                onChange={(e) => form.setBank(e.target.value)}
              >
                <option value="">เลือกธนาคาร</option>
                <option>กรุงเทพ (Bangkok Bank)</option>
                <option>กสิกรไทย (Kasikorn)</option>
                <option>ไทยพาณิชย์ (SCB)</option>
              </select>
            </div>

            <div style={styles.field}>
              <label>
                เลขที่บัญชี <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                style={styles.input}
                value={form.accountNo}
                onChange={(e) => form.setAccountNo(e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label>
                ราคาต่อหน่วย <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                style={styles.input}
                value={form.price}
                onChange={(e) => form.setPrice(e.target.value)}
              />
            </div>

            <button
              style={{
                ...styles.addBtn,
                opacity: isFormValid ? 1 : 0.5,
                cursor: isFormValid ? "pointer" : "not-allowed",
              }}
              disabled={!isFormValid}
              onClick={handleAddAccount}
            >
              เพิ่ม
            </button>

          </div>

          {/* ===== Table Header ===== */}
          <div style={styles.tableHeader}>
            <span>ชื่อบัญชี</span>
            <span style={{ justifySelf: "end" }}>เลขบัญชี</span>
          </div>

          {/* ===== List ===== */}
          <BankAccountList
            accounts={accounts}
            onDelete={handleDeleteAccount}
          />
        </div>

        {/* ===== Card: ขั้นตอนการชำระเงิน ===== */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>ขั้นตอนการแจ้งชำระเงิน</h3>
          <ul style={styles.list}>
            <li>รายละเอียดการชำระเงินจะแสดงในใบแจ้งหนี้</li>
          </ul>
        </div>

        {/* ===== Card: ข้อความแจ้งผู้เช่า ===== */}
        <div style={styles.card}>
          <label>
            ข้อความแจ้งผู้เช่า <span style={styles.required}>*</span>
          </label>
          <textarea
            rows={4}
            style={styles.textarea}
          />

          <p style={{ marginTop: 6, fontSize: 13, color: "#252525" }}>
            ตัวอย่าง: เมื่อชำระเงินแล้ว กรุณาส่งหลักฐานการชำระเงินมาที่ Line: @rentsphere หรือโทรแจ้ง 0922222222
          </p>

          <div style={{ textAlign: "right", marginTop: 16 }}>
            <button
              style={styles.saveBtn}
              onClick={() => {
                setShowSaved(true);
                setTimeout(() => setShowSaved(false), 3000);
              }}
            >
              บันทึก
            </button>
          </div>
        </div>

        {/* ===== Next Button ===== */}
        <div style={styles.nextRow}>
          <button
            style={styles.nextBtn}
            onClick={() => nav("../step-4")}
          >
            ต่อไป
          </button>
        </div>
      </div>
    </div>
  );
}


const styles: Record<string, React.CSSProperties> = {
  content: {
    flex: 1,
    padding: "28px 40px",
  },

  title: {
    textAlign: "center",
    fontSize: 34,
    fontWeight: 800,
    margin: "6px 0 22px",
    color: "rgba(0,0,0,0.85)",
  },

  centerCol: {
    width: "100%",
    maxWidth: 1120,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 22,
    boxShadow: "0 12px 22px rgba(0,0,0,0.12)",
  },

  cardTitle: {
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 700,
  },

  list: {
    paddingLeft: 18,
    color: "#555",
  },

  formRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 180,
  },

  input: {
    height: 40,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid #E5E7EB",
    background: "#FEFCE8",
  },

  textarea: {
    width: "100%",
    marginTop: 6,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "#FEFCE8",
  },

  required: {
    color: "red",
  },

  addBtn: {
    height: 40,
    padding: "0 18px",
    borderRadius: 10,
    border: "none",
    background: "#A78BFA",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  tableHeader: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "1fr auto",
    background: "#EDE9FE",
    padding: "12px 20px",
    borderRadius: "999px",
    fontWeight: 600,
    alignItems: "center",
  },

  empty: {
    textAlign: "center",
    padding: 16,
    color: "#999",
  },

  saveBtn: {
    height: 40,
    padding: "0 24px",
    borderRadius: 10,
    border: "none",
    background: "#A78BFA",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  nextRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 10,
  },

  nextBtn: {
    height: 46,
    width: 96,
    borderRadius: 12,
    border: "none",
    background: "#A78BFA",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 22px rgba(0,0,0,0.18)",
  },
};
