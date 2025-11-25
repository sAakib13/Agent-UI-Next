import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import SideBarLayout from "@/components/layout/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sahayata Agent Dashboard",
  description: "Overview of your Sahayata Agent platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {/* Pass the font class to the wrapper */}
          <SideBarLayout className={inter.className}>
            {children}
          </SideBarLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}