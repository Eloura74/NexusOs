import React from "react";
import { NavItem } from "../types";
import { Menu, X, Shield, Search, Bell, Command } from "lucide-react";
import { useData } from "../context/DataContext";

interface LayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  navItems,
  activeTab,
  onTabChange,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { searchQuery, setSearchQuery } = useData();

  // Fermer la sidebar lors du changement de route (mobile)
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans flex overflow-hidden">
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface-highlight transform transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-surface-highlight">
          <Shield className="w-6 h-6 text-primary mr-3" />
          <span className="font-mono font-bold text-lg tracking-wider text-white">
            NEXUS<span className="text-primary">.OS</span>
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                      : "text-slate-400 hover:bg-surface-highlight hover:text-white"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-slate-500"}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-surface-highlight">
          <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 font-mono border border-surface-highlight">
            <div className="flex items-center justify-between mb-2">
              <span>STATUT</span>
              <span className="text-green-400 font-bold">EN LIGNE</span>
            </div>
            <div className="flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              SYSTÈME V1.0.2
            </div>
          </div>
        </div>
      </aside>

      {/* Zone de Contenu Principal */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* En-tête */}
        <header className="h-16 bg-background/80 backdrop-blur-md border-b border-surface-highlight flex items-center justify-between px-4 lg:px-8 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 max-w-xl mx-4 lg:mx-0 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Rechercher services, docs, logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-12 py-2 border border-surface-highlight rounded-lg leading-5 bg-surface text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-sm"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <span className="flex items-center text-[10px] text-slate-500 font-mono border border-surface-highlight rounded px-1.5 py-0.5 bg-slate-900">
                  <Command className="w-3 h-3 mr-1" /> K
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative cursor-pointer hover:bg-surface-highlight p-2 rounded-full transition-colors group">
              <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-background"></div>
              <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-purple-600 border border-surface-highlight shadow-lg hover:shadow-primary/20 transition-shadow cursor-pointer"></div>
          </div>
        </header>

        {/* Vue Principale Défilable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
