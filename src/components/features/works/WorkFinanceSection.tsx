"use client";

interface Props {
  totalFee: number;
  paidAmount: number;
  totalExpenses: number;
}

export function WorkFinanceSection({ totalFee, paidAmount, totalExpenses }: Props) {
  const remaining = totalFee - paidAmount;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-[var(--muted-foreground)]">Finansal Özet</h4>
      <div className="grid grid-cols-2 gap-3">
        <FinanceItem label="Toplam Ücret" value={totalFee} />
        <FinanceItem label="Alınan" value={paidAmount} color="text-green-400" />
        <FinanceItem label="Kalan" value={remaining} color={remaining > 0 ? "text-yellow-400" : "text-green-400"} />
        <FinanceItem label="Toplam Harcama" value={totalExpenses} color="text-red-400" />
      </div>
    </div>
  );
}

function FinanceItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-lg bg-[var(--surface)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className={`text-lg font-semibold ${color ?? "text-[var(--foreground)]"}`}>
        ₺{value.toLocaleString("tr-TR")}
      </p>
    </div>
  );
}
