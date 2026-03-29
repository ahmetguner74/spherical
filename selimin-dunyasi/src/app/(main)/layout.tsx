import { Header, Footer } from "@/components/layout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main style={{ flex: 1, minHeight: "calc(100vh - 120px)" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
