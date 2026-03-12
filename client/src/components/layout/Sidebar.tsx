import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  LogOut,
  Box,
  BarChart3,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/inventory", icon: Package, label: "Inventory" },
    { href: "/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/customers", icon: Users, label: "Customers" },
    { href: "/suppliers", icon: Truck, label: "Suppliers" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <div className="h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shadow-xl fixed left-0 top-0">
      <div className="p-6 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <img
            src="/src/assets/ok.png"
            alt="Unique Pack"
            className="w-12 h-12 rounded-lg object-contain bg-white"
          />
          <div>
            <h1 className="font-bold text-white tracking-tight">Unique Pack</h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">
          Operations
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    active
                      ? "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }
                `}
              >
                <item.icon
                  className={`w-5 h-5 ${active ? "text-blue-400" : "text-slate-500"}`}
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-4">
        <a 
          href="https://uniqpack.net" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-full py-3 rounded-xl border border-slate-700/50 bg-slate-800/40 overflow-hidden group hover:border-slate-600 transition-all duration-300 hover:shadow-[0_0_20px_-10px_rgba(59,130,246,0.3)]"
        >
          {/* Continuous elegant pulsing background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 animate-pulse opacity-70 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Static subtle top highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>

          <div className="relative z-10 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
            <span className="font-medium tracking-wide text-sm bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:via-white group-hover:to-blue-200 transition-all duration-300">
              Visit Website
            </span>
          </div>
        </a>
      </div>

      <div className="p-4 border-t border-slate-800/50 bg-slate-950/30">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
            <span className="font-bold text-slate-300">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-slate-400 border-slate-700 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-colors"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}