import { VERSION } from "@/config/version";

export function Footer() {
  return (
    <footer
      style={{
        textAlign: "center",
        padding: "16px",
        fontSize: 12,
        color: "#666",
        fontFamily: "monospace",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      Selim&apos;in D\u00fcnyas\u0131 {VERSION.display}
    </footer>
  );
}
