"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Zap,
  Settings,
  LogOut,
  SlidersHorizontal,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider"; // <-- New import

// Define the structure for a navigation item
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Create Agent", href: "/create-agent", icon: Zap },
  {
    name: "Configure Agent",
    href: "/configure-agent",
    icon: SlidersHorizontal,
  },
  { name: "Account Settings", href: "/account-settings", icon: Settings },
];

// Reusable NavLink component
const NavLink: React.FC<NavItem & { isActive: boolean }> = ({
  name,
  href,
  icon: Icon,
  isActive,
}) => {
  // Updated classes for theme awareness
  const activeClasses = "bg-blue-600 text-white shadow-lg shadow-blue-600/50";
  const inactiveClasses =
    "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white";

  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-colors duration-200 ${
        isActive ? activeClasses : inactiveClasses
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{name}</span>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { toggleTheme, theme, Icon: ThemeIcon } = useTheme(); // <-- Use theme context

  // Function to check if the link is active
  const isLinkActive = (href: string) => {
    // Check if the current path exactly matches the href
    if (pathname === href) return true;

    // Check for nested routes (e.g., /configure-agent/123 should activate /configure-agent)
    if (href !== "/" && pathname.startsWith(href) && href !== "/dashboard")
      return true;

    // Special case for dashboard root
    if (
      href === "/dashboard" &&
      (pathname === "/" || pathname === "/dashboard")
    )
      return true;

    return false;
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between sticky top-0 h-screen transition-colors duration-300">
      <div>
        {/* Logo/App Name */}
        <div className="flex items-center space-x-2 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <Zap className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sahayata Agent
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              {...item}
              isActive={isLinkActive(item.href)}
            />
          ))}
        </nav>
      </div>

      {/* Logout Link and Theme Toggle */}
      <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center space-x-3 p-3 rounded-xl transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          aria-label={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
        >
          <ThemeIcon className="w-5 h-5" />
          <span>Switch to {theme === "light" ? "Dark" : "Light"} Mode</span>
        </button>

        {/* Logout Link */}
        <NavLink
          name="Logout"
          href="/logout"
          icon={LogOut}
          isActive={isLinkActive("/logout")}
        />
      </div>
    </aside>
  );
};
