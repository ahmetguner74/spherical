"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui";
import { Badge } from "@/components/ui";

export function CardShowcase() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Kart Basligi</CardTitle>
          <CardDescription>Kart aciklamasi burada yer alir.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--foreground)]">Kart icerigi</p>
        </CardContent>
        <CardFooter>
          <Badge variant="success">Aktif</Badge>
        </CardFooter>
      </Card>
      <Card hover={false}>
        <CardHeader>
          <CardTitle>Hover Kapalı</CardTitle>
          <CardDescription>Bu kartta hover efekti yok.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--foreground)]">Statik kart</p>
        </CardContent>
      </Card>
    </div>
  );
}
