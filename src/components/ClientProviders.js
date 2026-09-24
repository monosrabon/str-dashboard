"use client";

import { AuthProvider } from "@/lib/authContext";
import Sidebar from "@/components/Sidebar";

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </AuthProvider>
  );
}
