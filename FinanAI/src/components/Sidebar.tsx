import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Target, 
  Sparkles, 
  BarChart3, 
  User, 
  DollarSign,
  Menu,
  X
} from 'lucide-react';
import { UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  profile,
  onUpdateProfile 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState(profile.name);
  const [newBudget, setNewBudget] = useState(profile.monthlyBudgetLimit.toString());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transações', icon: ArrowRightLeft },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'chat', label: 'Assistente IA', icon: Sparkles, glow: true },
    { id: 'reports', label: 'Análises & Simulações', icon: BarChart3 },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: newName || 'Usuário Pro',
      monthlyBudgetLimit: parseFloat(newBudget) || 0
    });
    setIsModalOpen(false);
  };

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden w-full bg-brutal-panel border-b border-brutal-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 bg-brutal-green shadow-[0_0_8px_#22C55E]"></div>
          <span className="font-mono text-lg font-bold tracking-tighter">FINAN<span className="text-brutal-green">AI</span></span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="text-white hover:text-brutal-green transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] bg-brutal-bg z-30 flex flex-col justify-between p-6 border-b border-brutal-border">
          <nav className="flex flex-col gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 border font-mono text-sm tracking-tight transition-all duration-200 ${
                    isActive 
                      ? 'bg-brutal-panelLight border-brutal-green text-brutal-green shadow-neon-green' 
                      : 'border-brutal-border text-brutal-textMuted hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  <Icon size={18} className={item.glow ? 'text-brutal-green animate-pulse' : ''} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          
          {/* User Section (Mobile) */}
          <div className="border border-brutal-border bg-brutal-panel p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-neutral-800 border border-brutal-border flex items-center justify-center text-brutal-green">
                <User size={16} />
              </div>
              <div className="text-left">
                <p className="text-xs font-mono text-brutal-textMuted uppercase">Perfil</p>
                <h4 className="text-sm font-semibold font-mono">{profile.name}</h4>
              </div>
            </div>
            <button 
              onClick={() => { setIsModalOpen(true); setIsMobileMenuOpen(false); }}
              className="text-xs font-mono border border-brutal-border px-2 py-1 text-brutal-green hover:bg-neutral-800 transition-all"
            >
              Configurar
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-brutal-panel border-r border-brutal-border h-screen sticky top-0 p-6 z-10 shrink-0">
        <div>
          {/* Brand/Logo */}
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="h-3 w-3 bg-brutal-green shadow-[0_0_10px_#22C55E]"></div>
            <span className="font-mono text-xl font-bold tracking-widest">
              FINAN<span className="text-brutal-green">AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 border font-mono text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'bg-brutal-panelLight border-brutal-green text-brutal-green shadow-neon-green translate-x-1' 
                      : 'border-brutal-border text-brutal-textMuted hover:border-neutral-800 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <Icon size={16} className={item.glow ? 'text-brutal-green animate-pulse' : ''} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card & Budget Limit */}
        <div className="border border-brutal-border bg-brutal-panelLight p-4 relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 bg-neutral-800 border border-brutal-border flex items-center justify-center text-brutal-green">
              <User size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-mono text-brutal-textMuted uppercase tracking-wider">Usuário</p>
              <h4 className="text-sm font-semibold truncate font-mono">{profile.name}</h4>
            </div>
          </div>

          <div className="border-t border-brutal-border pt-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-brutal-textMuted">Teto Mensal:</span>
              <span className="text-brutal-green font-bold">R$ {profile.monthlyBudgetLimit.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full mt-3 border border-brutal-border hover:border-brutal-green hover:text-brutal-green text-[10px] uppercase font-mono tracking-wider py-1.5 transition-all duration-200 cursor-pointer"
          >
            Ajustar Perfil
          </button>
        </div>
      </aside>

      {/* Modal de Configuração de Perfil */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-brutal-panel border border-brutal-border p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-brutal-border pb-4 mb-4">
              <h3 className="font-mono text-base font-bold uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={18} className="text-brutal-green" /> Configurações de Perfil
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-brutal-textMuted hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-brutal-textMuted uppercase mb-1">Nome do Usuário</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="brutal-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-brutal-textMuted uppercase mb-1">Teto de Gastos Mensais (R$)</label>
                <input 
                  type="number" 
                  value={newBudget} 
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="brutal-input"
                  min="0"
                  required
                />
                <p className="text-[10px] text-brutal-textMuted mt-1 font-mono">
                  O FinanAI usará esse valor para calcular a saúde do seu orçamento mensal.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="brutal-btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="brutal-btn-primary"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
