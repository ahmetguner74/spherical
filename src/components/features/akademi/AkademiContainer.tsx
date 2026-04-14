"use client";

import { lazy, Suspense } from "react";
import { useAkademiData } from "./shared/useAkademiData";
import { KursListesi } from "./kurs/KursListesi";
import { IconLoader } from "@/config/icons";

const AdimViewer = lazy(() =>
  import("./adim/AdimViewer").then((m) => ({ default: m.AdimViewer }))
);

const AdimForm = lazy(() =>
  import("./adim/AdimForm").then((m) => ({ default: m.AdimForm }))
);

function ViewLoading() {
  return (
    <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
      <IconLoader className="h-5 w-5 animate-spin mr-2" />
      Yükleniyor...
    </div>
  );
}

export function AkademiContainer() {
  const { view, initialized } = useAkademiData();

  if (!initialized) {
    return <ViewLoading />;
  }

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      <Suspense fallback={<ViewLoading />}>
        {view === "kurslar" && <KursListesi />}
        {view === "kursDetay" && <AdimViewer />}
        {view === "adimDuzenle" && <AdimForm />}
      </Suspense>
    </div>
  );
}
