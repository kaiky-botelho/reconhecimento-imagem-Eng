import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  Sparkles, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Transaction, SavingsGoal, UserProfile } from '../types';
import { aiEngine } from '../services/aiEngine';

interface DashboardProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  profile: UserProfile;
  setCurrentTab: (tab: string) => void;
  onOpenAddTransaction: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  goals,
  profile,
  setCurrentTab,
  onOpenAddTransaction
}) => {
  const analysis = aiEngine.analyzeFinancialHealth(transactions, goals, profile);
  const totalBalance = analysis.totalIncome - analysis.totalExpense;

  // Preparar dados para o gráfico de fluxo de caixa (mensal/diário)
  // Vamos agrupar as transações recentes por data
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Agrupamento simples por data para o gráfico (últimas 7 transações datadas)
  const chartData = [...transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map(t => ({
      date: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      amount: t.amount,
      type: t.type,
      // Para o gráfico de Área, queremos acumular o fluxo de caixa
      Receitas: t.type === 'income' ? t.amount : 0,
      Despesas: t.type === 'expense' ? t.amount : 0,
    }));

  // Agrupar gastos por categoria para o gráfico de Pizza
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  const PIE_COLORS = ['#22C55E', '#EF4444', '#E5E5E5', '#A3A3A3', '#F59E0B', '#3B82F6', '#8B5CF6'];

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome bar & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brutal-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-tight uppercase">
            CONTROLE DE <span className="text-brutal-green">FINANÇAS</span>
          </h1>
          <p className="text-xs text-brutal-textMuted font-mono mt-1">
            Status do terminal: <span className="text-brutal-green font-bold animate-pulse">● ONLINE</span> | Perfil: <span className="text-white font-semibold">{profile.name}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onOpenAddTransaction}
            className="brutal-btn-primary"
          >
            <Plus size={16} /> Nova Transação
          </button>
          <button 
            onClick={() => setCurrentTab('chat')}
            className="brutal-btn-secondary gap-2"
          >
            <Sparkles size={16} className="text-brutal-green" /> Perguntar ao FinanAI
          </button>
        </div>
      </div>

      {/* Overview Cards (JetBrains Mono para valores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Saldo */}
        <div className="brutal-card border-l-4 border-l-brutal-green">
          <div className="flex justify-between items-start text-brutal-textMuted mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Saldo Geral</span>
            <Wallet size={16} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white">
            {formatCurrency(totalBalance)}
          </h2>
          <p className="text-[10px] font-mono text-brutal-textMuted mt-2 uppercase tracking-tight">
            Fundo em caixa líquido
          </p>
        </div>

        {/* Card Receitas */}
        <div className="brutal-card border-l-4 border-l-brutal-greenNeon">
          <div className="flex justify-between items-start text-brutal-textMuted mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Receitas</span>
            <TrendingUp size={16} className="text-brutal-green" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-brutal-green">
            {formatCurrency(analysis.totalIncome)}
          </h2>
          <p className="text-[10px] font-mono text-brutal-textMuted mt-2 uppercase tracking-tight">
            Total arrecadado no mês
          </p>
        </div>

        {/* Card Despesas */}
        <div className="brutal-card border-l-4 border-l-brutal-red">
          <div className="flex justify-between items-start text-brutal-textMuted mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Despesas</span>
            <TrendingDown size={16} className="text-brutal-red" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-brutal-red">
            {formatCurrency(analysis.totalExpense)}
          </h2>
          <p className="text-[10px] font-mono text-brutal-textMuted mt-2 uppercase tracking-tight">
            {analysis.budgetPercentage > 0 ? `${analysis.budgetPercentage.toFixed(0)}% do orçamento gasto` : 'Sem limite orçamentário'}
          </p>
        </div>

        {/* Card Eficiência (Savings Rate) */}
        <div className="brutal-card border-l-4 border-l-neutral-400">
          <div className="flex justify-between items-start text-brutal-textMuted mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Grau Financeiro</span>
            <PiggyBank size={16} className="text-neutral-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight">
              {analysis.savingsRate.toFixed(0)}%
            </h2>
            <span className={`text-base font-bold font-mono ${analysis.scoreColor}`}>({analysis.score})</span>
          </div>
          <p className="text-[10px] font-mono text-brutal-textMuted mt-2 uppercase tracking-tight">
            Taxa de retenção salarial
          </p>
        </div>
      </div>

      {/* AI Highlights Box (Box Brutalista com Acentos Neon) */}
      <div className="border border-brutal-green/40 bg-brutal-panelLight p-5 relative overflow-hidden shadow-neon-green">
        <div className="absolute top-0 right-0 h-16 w-16 bg-brutal-green/5 blur-xl"></div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-brutal-green animate-pulse" />
          <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-brutal-green">Insights do Assistente FinanAI</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.recommendations.slice(0, 2).map((rec, i) => (
            <div key={i} className="flex gap-3 text-xs leading-relaxed font-mono">
              <span className="text-brutal-green font-bold">▶</span>
              <p dangerouslySetInnerHTML={{ __html: rec }} className="text-neutral-300"></p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Flow Chart (AreaChart) */}
        <div className="brutal-card lg:col-span-2">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-textMuted mb-6">
            Histórico Recente de Caixa
          </h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDesp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    fontSize={10} 
                    fontFamily="JetBrains Mono" 
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={10} 
                    fontFamily="JetBrains Mono" 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#121216', 
                      borderColor: '#262626', 
                      color: '#FFF', 
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                      borderRadius: '0px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Receitas" 
                    stroke="#22C55E" 
                    fillOpacity={1} 
                    fill="url(#colorRec)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Despesas" 
                    stroke="#EF4444" 
                    fillOpacity={1} 
                    fill="url(#colorDesp)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-xs text-brutal-textMuted">
                Nenhum dado cadastrado para o gráfico
              </div>
            )}
          </div>
        </div>

        {/* Expenses by Category (PieChart) */}
        <div className="brutal-card">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-textMuted mb-6">
            Distribuição de Gastos
          </h3>
          <div className="h-48 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#121216', 
                      borderColor: '#262626', 
                      color: '#FFF', 
                      fontFamily: 'JetBrains Mono',
                      fontSize: '11px',
                      borderRadius: '0px'
                    }} 
                    formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Gasto']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center font-mono text-xs text-brutal-textMuted">
                Sem despesas registradas
              </div>
            )}
          </div>
          
          {/* Legenda customizada */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono border-t border-brutal-border pt-4">
            {pieData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate">
                <div 
                  className="h-2 w-2 shrink-0" 
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                ></div>
                <span className="truncate text-brutal-textMuted">{entry.name}:</span>
                <span className="text-white font-semibold">R$ {entry.value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions list */}
        <div className="brutal-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-textMuted">
              Histórico de Movimentações
            </h3>
            <button 
              onClick={() => setCurrentTab('transactions')}
              className="text-[10px] font-mono uppercase tracking-wider text-brutal-green hover:underline flex items-center gap-1 transition-all cursor-pointer"
            >
              Ver Tudo <ArrowRight size={10} />
            </button>
          </div>

          <div className="space-y-3">
            {recentTransactions.map((t) => (
              <div 
                key={t.id} 
                className="flex items-center justify-between p-3 border border-brutal-border bg-brutal-panelLight transition-all hover:border-neutral-800"
              >
                <div>
                  <h4 className="text-xs font-semibold font-mono text-white">{t.description}</h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span 
                      className="brutal-badge"
                      style={{ 
                        color: t.type === 'income' ? '#22C55E' : '#EF4444', 
                        borderColor: t.type === 'income' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' 
                      }}
                    >
                      {t.category}
                    </span>
                    <span className="text-[10px] font-mono text-brutal-textMuted">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <span className={`font-mono text-xs font-bold ${t.type === 'income' ? 'text-brutal-green' : 'text-brutal-red'}`}>
                  {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}

            {recentTransactions.length === 0 && (
              <div className="text-center py-6 font-mono text-xs text-brutal-textMuted">
                Nenhuma transação cadastrada ainda.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Active Goals progress summary */}
        <div className="brutal-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-brutal-textMuted">
              Metas de Economia Ativas
            </h3>
            <button 
              onClick={() => setCurrentTab('goals')}
              className="text-[10px] font-mono uppercase tracking-wider text-brutal-green hover:underline flex items-center gap-1 transition-all cursor-pointer"
            >
              Gerenciar Metas <ArrowRight size={10} />
            </button>
          </div>

          <div className="space-y-4">
            {goals.slice(0, 2).map((goal) => {
              const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              
              // Estimativa analítica local
              const remainingAmount = goal.targetAmount - goal.currentAmount;
              const monthlySavings = totalBalance > 0 ? totalBalance : 500; // fallback se saldo for negativo
              const monthsToComplete = monthlySavings > 0 ? remainingAmount / monthlySavings : Infinity;

              return (
                <div key={goal.id} className="p-4 border border-brutal-border bg-brutal-panelLight">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-white uppercase">{goal.title}</h4>
                      {goal.targetDate && (
                        <p className="text-[9px] font-mono text-brutal-textMuted uppercase mt-0.5">
                          Alvo: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-bold font-mono text-brutal-green">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress bar brutalista */}
                  <div className="w-full bg-neutral-800 h-2 border border-brutal-border mb-3 relative overflow-hidden">
                    <div 
                      className="bg-brutal-green h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono border-t border-neutral-800/80 pt-2">
                    <span className="text-brutal-textMuted">
                      R$ {goal.currentAmount.toLocaleString('pt-BR')} / R$ {goal.targetAmount.toLocaleString('pt-BR')}
                    </span>
                    {monthsToComplete !== Infinity && monthsToComplete > 0 ? (
                      <span className="text-neutral-400">
                        Restam ~{Math.ceil(monthsToComplete)} meses
                      </span>
                    ) : (
                      <span className="text-brutal-red font-semibold">Sem saldo livre mensal</span>
                    )}
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && (
              <div className="text-center py-8 font-mono text-xs text-brutal-textMuted">
                Nenhuma meta criada ainda. Comece a poupar hoje!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
