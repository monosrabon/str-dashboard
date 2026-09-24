import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "STR Manager — Property Management Dashboard",
  description:
    "AI-powered short-term rental property management system. Manage reservations, cleaning, maintenance, and revenue from a single dashboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
