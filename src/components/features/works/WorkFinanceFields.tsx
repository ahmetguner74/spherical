"use client";

interface Props {
  totalFee: number;
  paidAmount: number;
  onTotalFeeChange: (val: number) => void;
  onPaidAmountChange: (val: number) => void;
}

export function WorkFinanceFields({ totalFee, paidAmount, onTotalFeeChange, onPaidAmountChange }: Props) {
  const remaining = totalFee - paidAmount;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-[var(--foreground)]">Finansal Bilgiler</label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--muted-foreground)]">Toplam Ücret (₺)</label>
          <input
            type="number"
            min={0}
            value={totalFee || ""}
            onChange={(e) => onTotalFeeChange(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--muted-foreground)]">Alınan (₺)</label>
          <input
            type="number"
            min={0}
            value={paidAmount || ""}
            onChange={(e) => onPaidAmountChange(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>
      </div>
      {totalFee > 0 && (
        <p className={`text-sm font-medium ${remaining > 0 ? "text-yellow-400" : "text-green-400"}`}>
          Kalan: ₺{remaining.toLocaleString("tr-TR")}
        </p>
      )}
    </div>
  );
}
