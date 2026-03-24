import React from 'react';
import { GraduationCap, Home, Route, FileQuestion, MessageSquare, TrendingUp, Settings, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userInitials?: string;
  onLogout?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  userName = 'Aluno',
  userInitials = 'AL',
  onLogout 
}) => {
  const location = useLocation();

  const navItems = [
    { path: '/hoje', label: 'Hoje', icon: Home },
    { path: '/trilhas', label: 'Trilhas', icon: Route },
    { path: '/questoes', label: 'Questões', icon: FileQuestion },
    { path: '/tutor', label: 'Tutor', icon: MessageSquare },
    { path: '/progresso', label: 'Progresso', icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Desktop Sidebar - Navigation Rail */}
      <aside className="hidden md:flex w-20 lg:w-64 bg-zinc-950 flex-col border-r border-zinc-800">
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-white">MedTutor</h1>
              <p className="text-xs text-zinc-500">UNIOESTE</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-zinc-800 text-emerald-400' 
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="hidden lg:block font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white text-sm">
              {userInitials}
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{userName}</p>
              <p className="text-xs text-zinc-500">Estudante</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-4 w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden lg:block">Sair</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 z-50">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-emerald-600' 
                    : 'text-zinc-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
