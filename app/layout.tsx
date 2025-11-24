import "./globals.css";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sahayata Agent Dashboard",
  description: "Overview of your Sahayata Agent platform",
};

// This component defines the entire application frame (Sidebar + Content)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gray-900 text-white min-h-screen flex`}
      >
        {/* Sidebar - Fixed width, dark background */}
        <Sidebar />

        {/* Main Content Area - Takes remaining space, scrolls vertically */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
