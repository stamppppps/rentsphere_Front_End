type Account = {
  id: number;
  bank: string;
  accountNo: string;
  price: string;
};

type Props = {
  accounts: Account[];
  onDelete: (id: number) => void;
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
            gridTemplateColumns: "1fr auto auto",
            padding: "12px 20px",
            borderBottom: "1px solid #E5E7EB",
            alignItems: "center",
          }}
        >
          <span>{acc.bank}</span>
          <span>{acc.accountNo}</span>
          <button onClick={() => onDelete(acc.id)}>🗑️</button>
        </div>
      ))}
    </>
  );
}
