type Account = {
  id: string;
  bankCode: string;
  bankLabel: string; 
  accountNo: string;
  accountName: string;
};

type Props = {
  accounts: Account[];
  onDelete: (id: string) => void;
};

export default function BankAccountList({ accounts, onDelete }: Props) {
  if (accounts.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 16, color: "#999" }}>
        ไม่มีข้อมูล
      </div>
    );
  }

  return (
    <>
      {accounts.map((acc) => (
        <div
          key={acc.id}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            padding: "12px 20px",
            borderBottom: "1px solid #E5E7EB",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>{acc.bankLabel}</span>
          <span>{acc.accountName}</span>
          <span style={{ justifySelf: "end" }}>{acc.accountNo}</span>
          <button type="button" onClick={() => onDelete(acc.id)}>
            🗑️
          </button>
        </div>
      ))}
    </>
  );
}