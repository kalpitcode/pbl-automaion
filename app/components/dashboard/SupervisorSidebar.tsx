import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, ClipboardList, Users, LayoutDashboard, Award } from 'lucide-react';

const SupervisorSidebar = () => {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard/supervisor',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      href: '/dashboard/supervisor/requests',
      icon: Users,
      label: 'Supervisor Requests',
    },
    {
      href: '/dashboard/supervisor/groups',
      icon: GraduationCap,
      label: 'My Groups',
    },
    {
      href: '/dashboard/supervisor/grades',
      icon: Award,
      label: 'Grade Students',
    },
  ];

  return (
    <div className="w-64 bg-white border-r shadow-sm flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-gray-900">Supervisor Portal</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SupervisorSidebar;

