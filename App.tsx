import React, { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./modules/Dashboard";
import Projects from "./modules/Projects";
import Documentation from "./modules/Documentation";
import { DataProvider } from "./context/DataContext";
import { NavItem } from "./types";
import {
  LayoutDashboard,
  ListTodo,
  BookOpen,
  Terminal,
  Settings,
} from "lucide-react";

// Placeholder modules for V1 scope
const PlaceholderModule: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500 animate-fade-in">
    <Terminal className="w-16 h-16 mb-4 opacity-20" />
    <h2 className="text-xl font-bold text-slate-400 mb-2">{title}</h2>
    <p className="text-sm">Module non initialisé dans le Core V1.</p>
  </div>
);

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Tableau de Bord",
      icon: LayoutDashboard,
      component: <Dashboard />,
    },
    {
      id: "projects",
      label: "Projets",
      icon: ListTodo,
      component: <Projects />,
    },
    {
      id: "docs",
      label: "Documentation",
      icon: BookOpen,
      component: <Documentation />,
    },
    {
      id: "terminal",
      label: "Terminal Web",
      icon: Terminal,
      component: <PlaceholderModule title="Terminal Web" />,
    },
    {
      id: "settings",
      label: "Système",
      icon: Settings,
      component: <PlaceholderModule title="Paramètres Système" />,
    },
  ];

  const activeComponent = navItems.find((item) => item.id === activeTab)
    ?.component || <Dashboard />;

  return (
    <Layout
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeComponent}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;
