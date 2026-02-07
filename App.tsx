import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink as RouterNavLink,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./modules/Dashboard";
import Projects from "./modules/Projects";
import ProjectDetails from "./modules/ProjectDetails";
import Documentation from "./modules/Documentation";
import SettingsModule from "./modules/Settings";
import TerminalModule from "./modules/Terminal";
import { DataProvider } from "./context/DataContext";
import { NotificationProvider } from "./context/NotificationContext";
import {
  LayoutDashboard,
  ListTodo,
  BookOpen,
  Terminal,
  Settings,
  TerminalSquare, // New import
  LogOut, // New import
} from "lucide-react";
import ChatWidget from "./components/ChatWidget"; // New import

// Placeholder modules for V1 scope
const PlaceholderModule: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 animate-fade-in">
    <Terminal className="w-16 h-16 mb-4 opacity-20" />
    <h2 className="text-xl font-bold text-slate-400 mb-2">{title}</h2>
    <p className="text-sm">Module non initialisé dans le Core V1.</p>
  </div>
);

// Custom NavLink component for the new sidebar
interface CustomNavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavLink: React.FC<CustomNavLinkProps> = ({ to, icon, label, active }) => (
  <li>
    <RouterNavLink
      to={to}
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 ${
        active
          ? "bg-white/10 text-blue-300 shadow-lg"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      }`}
    >
      <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
      <span className="text-sm font-medium hidden md:block">{label}</span>
    </RouterNavLink>
  </li>
);

// AppContent is now simplified to just render the routes
const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/terminal" element={<TerminalModule />} />
      <Route path="/settings" element={<SettingsModule />} />
      {/* Fallback for unknown routes */}
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

const App: React.FC = () => {
  const location = useLocation(); // Hook to get current location for active link styling

  return (
    <NotificationProvider>
      <DataProvider>
        {/* Animated Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0f172a]">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="flex h-screen w-screen overflow-hidden text-slate-100 font-sans selection:bg-blue-500/30">
          {/* Sidebar (Glass) */}
          <nav className="w-20 md:w-64 glass-panel m-4 mr-0 flex flex-col justify-between transition-all duration-300 z-50">
            <div>
              <div className="p-6 flex items-center justify-center md:justify-start gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40 rounded-full"></div>
                  <Terminal className="w-8 h-8 text-blue-400 relative z-10" />
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 hidden md:block tracking-tight">
                  Nexus<span className="font-light text-slate-300">OS</span>
                </h1>
              </div>

              <ul className="space-y-2 px-3">
                <NavLink
                  to="/"
                  icon={<LayoutDashboard />}
                  label="Dashboard"
                  active={location.pathname === "/"}
                />
                <NavLink
                  to="/projects"
                  icon={<ListTodo />}
                  label="Projets"
                  active={location.pathname.startsWith("/projects")}
                />
                <NavLink
                  to="/terminal"
                  icon={<TerminalSquare />}
                  label="Terminal Web"
                  active={location.pathname === "/terminal"}
                />
                <NavLink
                  to="/docs"
                  icon={<BookOpen />}
                  label="Journal & Docs"
                  active={location.pathname === "/docs"}
                />
                <NavLink
                  to="/settings"
                  icon={<Settings />}
                  label="Paramètres"
                  active={location.pathname === "/settings"}
                />
              </ul>
            </div>

            <div className="p-4 border-t border-white/5">
              <div className="flex items-center justify-center md:justify-start gap-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer group">
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium hidden md:block">
                  Déconnexion
                </span>
              </div>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 p-4 overflow-hidden relative">
            {/* Header / Top Bar could go here */}
            <div className="h-full glass-panel overflow-y-auto p-6 scroll-smooth">
              <AppContent />
            </div>
          </main>
        </div>

        <ChatWidget />
      </DataProvider>
    </NotificationProvider>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
