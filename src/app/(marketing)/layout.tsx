import { Footer, Header } from "@/components/layout";
import { ToastContainer } from "@/components/ui/Toast";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
    </>
  );
}
