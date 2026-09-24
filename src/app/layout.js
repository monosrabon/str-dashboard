import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata = {
  title: "AURA STR Enterprise — Operations & Asset Management",
  description:
    "Institutional short-term rental management platform with RBAC governance, turnover scheduling, facilities work orders, and financial telemetry.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
