import Link from 'next/link';
import { Home, Zap, Settings, LogOut, SlidersHorizontal } from 'lucide-react';

// Define the structure for a navigation item
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Create Agent', href: '/create-agent', icon: Zap },
  { name: 'Configure Agent', href: '/configure-agent', icon: SlidersHorizontal },
  { name: 'Account Settings', href: '/account-settings', icon: Settings },
];

// Reusable NavLink component (in the actual app, this would be in NavLink.tsx)
const NavLink: React.FC<NavItem & { isActive: boolean }> = ({ name, href, icon: Icon, isActive }) => {
  const activeClasses = 'bg-blue-600 text-white';
  const inactiveClasses = 'text-gray-400 hover:bg-gray-800 hover:text-white';
  
  return (
    <Link 
      href={href}
      className={`flex items-center space-x-3 p-3 rounded-xl transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon className="w-5 h-5" />
      <span>{name}</span>
    </Link>
  );
};


export const Sidebar: React.FC = () => {
  // In a real app, use next/router or next/navigation to determine the active path
  const currentPath = '/dashboard'; // Mocking the active path for this example

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 p-6 flex flex-col justify-between sticky top-0 h-screen">
      <div>
        {/* Logo/App Name */}
        <div className="flex items-center space-x-2 mb-8 border-b border-gray-800 pb-4">
          <Zap className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold tracking-tight">Sahayata Agent</h1>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink 
              key={item.name} 
              {...item} 
              isActive={item.href === currentPath} 
            />
          ))}
        </nav>
      </div>

      {/* Logout Link */}
      <div className="mt-8 pt-4 border-t border-gray-800">
        <NavLink 
          name="Logout" 
          href="/logout" 
          icon={LogOut} 
          isActive={false} // Logout is never active
        />
      </div>
    </aside>
  );
};