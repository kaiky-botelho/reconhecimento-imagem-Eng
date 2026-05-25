import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Coins, 
  Calendar, 
  Sparkles,
  X 
} from 'lucide-react';
import { SavingsGoal, Transaction } from '../types';

interface MetasTrackerProps {
  goals: SavingsGoal[];
  transactions: Transaction[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalAmount: (id: string, amount: number) => void;
}

export const MetasTracker: React.FC<MetasTrackerProps> = ({
  goals,
  transactions,
  onAddGoal,
  onDeleteGoal,
  onUpdateGoalAmount
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAporteModalOpen, setIsAporteModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Inputs Nova Meta
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Input Aporte
  const [aporteValue, setAporteValue] = useState('');

  // Calcular poupança média recente para a IA calcular previsões
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const averageMonthlySavings = totalIncome - totalExpense;

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;

    if (isNaN(target) || target <= 0) return;

    onAddGoal({
      title,
      targetAmount: target,
      currentAmount: current,
      targetDate: targetDate || undefined
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setIsAddModalOpen(false);
  };

  const handleAporte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const value = parseFloat(aporteValue);
    if (isNaN(value) || value <= 0) return;

    onUpdateGoalAmount(selectedGoal.id, value);
    setAporteValue('');
    setIsAporteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brutal-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-tight uppercase">
            METAS DE <span className="text-brutal-green">ECONOMIA</span>
          </h1>
          <p className="text-xs text-brutal-textMuted font-mono mt-1">
            Planeje seus objetivos de poupança com projeção analítica em tempo real.
          </p>
        </div>
        
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="brutal-btn-primary"
        >
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      {/* Caixa de Aviso IA Projeção Geral */}
      <div className="border border-brutal-border bg-brutal-panel p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles size={18} className="text-brutal-green animate-pulse" />
          <div className="font-mono text-xs">
            <p className="text-white uppercase font-bold">Projeção Geral do Terminal IA</p>
            <p className="text-brutal-textMuted mt-1">
              Sobra mensal de caixa ativa: <span className={averageMonthlySavings > 0 ? 'text-brutal-green font-bold' : 'text-brutal-red font-bold'}>
                R$ {averageMonthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </p>
          </div>
        </div>
        <div className="text-[10px] font-mono uppercase bg-brutal-panelLight border border-brutal-border px-3 py-1.5 text-brutal-textMuted">
          {averageMonthlySavings > 0 
            ? '🚀 Ritmo de poupança estável' 
            : '⚠️ Atenção: Caixa zerado dificulta metas'}
        </div>
      </div>

      {/* Grid de Metas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const isCompleted = percentage >= 100;
          
          // Cálculo IA Local da projeção
          const needed = goal.targetAmount - goal.currentAmount;
          const monthsToComplete = averageMonthlySavings > 0 ? needed / averageMonthlySavings : Infinity;

          return (
            <div 
              key={goal.id} 
              className={`brutal-card flex flex-col justify-between border-t-4 ${
                isCompleted 
                  ? 'border-t-brutal-green' 
                  : 'border-t-brutal-greenNeon/40 hover:border-t-brutal-green'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase text-white tracking-wider">
                      {goal.title}
                    </h3>
                    {goal.targetDate && (
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-brutal-textMuted uppercase mt-1">
                        <Calendar size={10} />
                        <span>Previsão do usuário: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brutal-green">
                      {percentage.toFixed(1)}%
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Excluir a meta "${goal.title}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="text-neutral-500 hover:text-brutal-red transition-colors p-1 cursor-pointer"
                      title="Excluir Meta"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="w-full bg-neutral-800 h-3 border border-brutal-border relative overflow-hidden mb-4">
                  <div 
                    className="bg-brutal-green h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {/* Valores */}
                <div className="flex justify-between items-baseline text-xs font-mono mb-4">
                  <span className="text-brutal-textMuted">Acumulado:</span>
                  <span className="text-white font-bold">
                    R$ {goal.currentAmount.toLocaleString('pt-BR')} <span className="text-brutal-textMuted font-normal">/ R$ {goal.targetAmount.toLocaleString('pt-BR')}</span>
                  </span>
                </div>
              </div>

              {/* Projeção IA e Ações */}
              <div className="border-t border-brutal-border pt-4 mt-2 space-y-3">
                {/* Projeção por Meta */}
                <div className="bg-brutal-panelLight/40 p-2.5 border border-brutal-border font-mono text-[10px]">
                  <span className="text-brutal-green font-bold">★ ANÁLISE PREDITIVA IA:</span>
                  <p className="text-neutral-300 mt-1">
                    {isCompleted ? (
                      <span className="text-brutal-green font-bold">🎉 Meta conquistada com sucesso!</span>
                    ) : monthsToComplete === Infinity || monthsToComplete < 0 ? (
                      <span className="text-brutal-red">Sua sobra de caixa atual é negativa. Ajuste o fluxo mensal para simular projeções.</span>
                    ) : (
                      <span>
                        Com a economia de R$ {averageMonthlySavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês, restam aproximadamente **{Math.ceil(monthsToComplete)} meses** para conclusão.
                      </span>
                    )}
                  </p>
                </div>

                {/* Botões de Ação */}
                {!isCompleted && (
                  <button
                    onClick={() => {
                      setSelectedGoal(goal);
                      setAporteValue('');
                      setIsAporteModalOpen(true);
                    }}
                    className="w-full brutal-btn-secondary py-1.5 gap-2"
                  >
                    <Coins size={12} className="text-brutal-green" /> Registrar Aporte
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-2 text-center py-20 brutal-card">
            <Target size={32} className="mx-auto text-brutal-textMuted mb-3 animate-pulse" />
            <h3 className="font-mono text-sm font-bold uppercase text-white">Nenhuma meta cadastrada</h3>
            <p className="font-mono text-xs text-brutal-textMuted max-w-sm mx-auto mt-2 leading-relaxed">
              Crie objetivos de economia (compra de eletrônicos, reserva de emergência, viagens) para receber análises analíticas de conclusão.
            </p>
          </div>
        )}
      </div>

      {/* Modal Criar Meta */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-brutal-panel border border-brutal-border p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-brutal-border pb-4 mb-4">
              <h3 className="font-mono text-base font-bold uppercase tracking-wider flex items-center gap-2">
                <Target size={18} className="text-brutal-green" /> Nova Meta de Economia
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-brutal-textMuted hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-brutal-textMuted uppercase mb-1">Título da Meta</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reserva de Emergência, Intercâmbio..."
                  className="brutal-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-brutal-textMuted uppercase mb-1">Alvo Total (R$)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0,00"
                    className="brutal-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-brutal-textMuted uppercase mb-1">Já Tenho (R$)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0,00"
                    className="brutal-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-brutal-textMuted uppercase mb-1">Data Limite Desejada</label>
                <input 
                  type="date" 
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="brutal-input"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-brutal-border mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="brutal-btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="brutal-btn-primary"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Aporte */}
      {isAporteModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-brutal-panel border border-brutal-border p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-brutal-border pb-4 mb-4">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Coins size={16} className="text-brutal-green" /> Registrar Poupança
              </h3>
              <button 
                onClick={() => setIsAporteModalOpen(false)}
                className="text-brutal-textMuted hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAporte} className="space-y-4">
              <p className="font-mono text-xs text-brutal-textMuted">
                Adicionar fundos para a meta <span className="text-white font-bold">{selectedGoal.title}</span>.
              </p>

              <div>
                <label className="block text-xs font-mono text-brutal-textMuted uppercase mb-1">Valor do Aporte (R$)</label>
                <input 
                  type="number" 
                  min="0.01"
                  step="0.01"
                  value={aporteValue}
                  onChange={(e) => setAporteValue(e.target.value)}
                  placeholder="0,00"
                  className="brutal-input"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAporteModalOpen(false)}
                  className="brutal-btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="brutal-btn-primary"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
