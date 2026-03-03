import React from 'react';
import { BookOpen, Calendar, MessageSquare, Award, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'chat' | 'resources' | 'progress';
  setView: (view: 'dashboard' | 'chat' | 'resources' | 'progress') => void;
  userName: string;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, userName }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: Calendar },
    { id: 'chat', label: 'Tutor IA', icon: MessageSquare },
    { id: 'resources', label: 'Trilhas', icon: BookOpen },
    // { id: 'progress', label: 'Progresso', icon: Award }, // Simplified for MVP
  ] as const;

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-brand-600">MedTutor</h1>
          <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">UNIOESTE</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <nav className={`
        fixed md:relative inset-y-0 left-0 bg-white border-r border-surface-200 w-64 transform transition-transform duration-200 ease-in-out z-10
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="hidden md:block mb-1">
            <h1 className="text-2xl font-bold text-brand-600">MedTutor</h1>
            <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">Medicina UNIOESTE</span>
          </div>
          <p className="text-sm text-surface-500 hidden md:block mb-8">Futuro médico, {userName}</p>

          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-brand-600'
                    }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-surface-200">
            <button
              onClick={() => {
                if (confirm("Tem certeza? Isso apagará todo seu progresso e histórico.")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors duration-200"
            >
              <X size={20} />
              Resetar Progresso
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
