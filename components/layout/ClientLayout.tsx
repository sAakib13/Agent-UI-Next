"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default function SideBarLayout({
    children,
    className,
}: {
    children: React.ReactNode;
    className: string;
}) {
    const pathname = usePathname();

    // Define which pages should NOT have a sidebar
    const noSidebarRoutes = ["/login", "/logout", "/", "/register", "/blogs"];
    const showSidebar = !noSidebarRoutes.includes(pathname);

    return (
        <div
            className={`${className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen transition-colors duration-300 ${showSidebar ? "flex" : "flex flex-col"
                }`}
        >
            {showSidebar && <Sidebar />}

            <main className={showSidebar ? "flex-1 p-8 overflow-y-auto" : "w-full"}>
                {children}
            </main>
        </div>
    );
}