"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Zap, Settings, LogOut, SlidersHorizontal } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

// Updated "Configure Agent" to "Agent Management"
const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Create Agent", href: "/create-agent", icon: Zap },
  {
    name: "Agent Management",
    href: "/configure-agent",
    icon: SlidersHorizontal,
  },
  { name: "Account Settings", href: "/account-settings", icon: Settings },
];

const NavLink: React.FC<NavItem & { isActive: boolean }> = ({
  name,
  href,
  icon: Icon,
  isActive,
}) => {
  const activeClasses =
    "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold";
  const inactiveClasses =
    "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200";

  return (
    <Link
      href={href}
      className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        isActive ? activeClasses : inactiveClasses
      }`}
    >
      <Icon
        className={`w-5 h-5 transition-transform duration-200 ${
          isActive ? "scale-110" : "group-hover:scale-110"
        }`}
      />
      <span>{name}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
      )}
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { toggleTheme, theme, Icon: ThemeIcon } = useTheme();

  const isLinkActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== "/" && pathname.startsWith(href) && href !== "/dashboard")
      return true;
    if (
      href === "/dashboard" &&
      (pathname === "/" || pathname === "/dashboard")
    )
      return true;
    return false;
  };

  return (
    <aside className="w-72 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 flex flex-col justify-between sticky top-0 h-screen transition-colors duration-300 z-50 shadow-sm">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-10 pl-2">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sahayata
            <span className="text-blue-600 dark:text-blue-400">Agent</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              {...item}
              isActive={isLinkActive(item.href)}
            />
          ))}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white group"
        >
          <ThemeIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-medium">
            Switch to {theme === "light" ? "Dark" : "Light"}
          </span>
        </button>

        <Link
          href="/logout"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Log Out</span>
        </Link>
      </div>
    </aside>
  );
};
