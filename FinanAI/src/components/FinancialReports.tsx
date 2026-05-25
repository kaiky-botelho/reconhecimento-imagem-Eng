import React, { useState } from 'react';
import { 
  BarChart3, 
  Sparkles, 
  HelpCircle,
  TrendingUp, 
  TrendingDown, 
  Target,
  AlertTriangle,
  CheckCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { Transaction, SavingsGoal, UserProfile } from '../types';
import { aiEngine } from '../services/aiEngine';

interface FinancialReportsProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
  profile: UserProfile;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  transactions,
  goals,
  profile
}) => {
  // Estados do Simulador de Compras
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [isParcelado, setIsParcelado] = useState(false);
  const [parcelsCount, setParcelsCount] = useState(1);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense;

  // Agrupar despesas por categoria
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const chartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const PIE_COLORS = ['#22C55E', '#EF4444', '#E5E5E5', '#A3A3A3', '#F59E0B', '#3B82F6', '#8B5CF6'];

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(itemValue);
    if (isNaN(val) || val <= 0) return;

    let verdict = 'safe';
    let verdictText = 'SEGURO';
    let verdictColor = 'border-brutal-green text-brutal-green bg-brutal-green/5 shadow-neon-green';
    let verdictIcon = <CheckCircle className="text-brutal-green" size={24} />;
    
    const monthlyCost = isParcelado ? (val / parcelsCount) : val;

    if (netSavings <= 0) {
      verdict = 'danger';
      verdictText = 'RISCO CRÍTICO';
      verdictColor = 'border-brutal-red text-brutal-red bg-brutal-red/5 shadow-neon-red';
      verdictIcon = <AlertTriangle className="text-brutal-red" size={24} />;
    } else if (isParcelado && monthlyCost > netSavings) {
      verdict = 'danger';
      verdictText = 'RISCO CRÍTICO';
      verdictColor = 'border-brutal-red text-brutal-red bg-brutal-red/5 shadow-neon-red';
      verdictIcon = <AlertTriangle className="text-brutal-red" size={24} />;
    } else if (val > netSavings * 3) {
      verdict = 'warning';
      verdictText = 'RISCO MODERADO';
      verdictColor = 'border-yellow-500 text-yellow-500 bg-yellow-500/5 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
      verdictIcon = <AlertTriangle className="text-yellow-500" size={24} />;
    }

    // Calcular atraso de metas
    const delays: string[] = [];
    if (goals.length > 0) {
      goals.forEach(goal => {
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining > 0 && netSavings > 0) {
          const currentMonths = remaining / netSavings;
          const newSavings = netSavings - (isParcelado ? monthlyCost : 0);
          
          if (newSavings > 0) {
            const newMonths = isParcelado 
              ? (remaining / newSavings) 
              : ((remaining + val) / netSavings); // Simula atraso comprando à vista
            
            const difference = newMonths - currentMonths;
            if (difference > 0) {
              delays.push(`Atrasa a meta **${goal.title}** em aproximadamente **${difference.toFixed(1)} meses**.`);
            }
          } else {
            delays.push(`⚠️ IMPEDE totalmente a conclusão da meta **${goal.title}**, pois seu saldo de poupança mensal zera.`);
          }
        }
      });
    }

    setSimulationResult({
      verdict,
      verdictText,
      verdictColor,
      verdictIcon,
      monthlyCost,
      val,
      itemName,
      isParcelado,
      parcelsCount,
      delays,
      percentageOfSavings: netSavings > 0 ? (monthlyCost / netSavings) * 100 : 100
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-brutal-border pb-5">
        <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-tight uppercase">
          ANÁLISES & <span className="text-brutal-green">SIMULAÇÕES</span>
        </h1>
        <p className="text-xs text-brutal-textMuted font-mono mt-1">
          Simulador avançado de decisão de compra e análises aprofundadas de caixa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Simulador de Decisão de Compra (Fácil e Super Interativo) */}
        <div className="brutal-card">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={16} className="text-brutal-green animate-pulse" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Simulador de Compras FinanAI
            </h3>
          </div>

          <form onSubmit={handleSimulate} className="space-y-4">
            <p className="text-xs font-mono text-brutal-textMuted leading-relaxed">
              Descubra matematicamente se aquela compra dos sonhos é segura ou se arruinará seu planejamento financeiro.
            </p>

            <div>
              <label className="block text-[10px] font-mono text-brutal-textMuted uppercase mb-1">Nome do Item</label>
              <input 
                type="text" 
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Ex: PlayStation 5, iPhone 16..."
                className="brutal-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-brutal-textMuted uppercase mb-1">Valor Total (R$)</label>
                <input 
                  type="number" 
                  min="1"
                  value={itemValue}
                  onChange={(e) => setItemValue(e.target.value)}
                  placeholder="0,00"
                  className="brutal-input"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-brutal-textMuted uppercase mb-1">Forma de Pagamento</label>
                <div className="flex border border-brutal-border bg-brutal-panelLight p-0.5">
                  <button
                    type="button"
                    onClick={() => { setIsParcelado(false); setParcelsCount(1); }}
                    className={`flex-1 text-[10px] uppercase font-mono py-1.5 transition-all text-center cursor-pointer ${
                      !isParcelado ? 'bg-brutal-green text-black font-bold' : 'text-brutal-textMuted hover:text-white'
                    }`}
                  >
                    À Vista
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsParcelado(true)}
                    className={`flex-1 text-[10px] uppercase font-mono py-1.5 transition-all text-center cursor-pointer ${
                      isParcelado ? 'bg-brutal-green text-black font-bold' : 'text-brutal-textMuted hover:text-white'
                    }`}
                  >
                    Parcelar
                  </button>
                </div>
              </div>
            </div>

            {isParcelado && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-[10px] font-mono text-brutal-textMuted uppercase mb-1">Número de Parcelas</label>
                <select
                  value={parcelsCount}
                  onChange={(e) => setParcelsCount(parseInt(e.target.value))}
                  className="brutal-input"
                >
                  {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map(p => (
                    <option key={p} value={p}>{p}x sem juros</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full brutal-btn-primary py-2.5 mt-2"
            >
              Iniciar Simulação de Compra
            </button>
          </form>

          {/* Resultado do Simulador */}
          {simulationResult && (
            <div className={`mt-6 border p-4 animate-in slide-in-from-bottom-2 duration-300 ${simulationResult.verdictColor}`}>
              <div className="flex items-center gap-3 mb-3">
                {simulationResult.verdictIcon}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-brutal-textMuted">Veredito FinanAI</p>
                  <h4 className="text-sm font-bold font-mono uppercase">{simulationResult.verdictText}</h4>
                </div>
              </div>

              <div className="font-mono text-xs text-neutral-200 space-y-2 border-t border-current/20 pt-3">
                <p>
                  A aquisição do item **{simulationResult.itemName}** no valor de **R$ {simulationResult.val.toLocaleString('pt-BR')}** 
                  {simulationResult.isParcelado 
                    ? ` parcelado em ${simulationResult.parcelsCount}x custará **R$ ${simulationResult.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês**.`
                    : ' à vista consumirá o valor total de uma única vez.'}
                </p>

                {netSavings > 0 ? (
                  <p>
                    Isso representa **{simulationResult.percentageOfSavings.toFixed(1)}%** de toda a sua poupança líquida mensal (R$ {netSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}).
                  </p>
                ) : (
                  <p className="text-brutal-red font-bold">
                    ⚠️ Seu saldo mensal atual está deficitário (saldo de R$ {netSavings.toLocaleString('pt-BR')}), o que torna esta compra inviável sem contrair juros de cartão de crédito.
                  </p>
                )}

                {simulationResult.delays.length > 0 && (
                  <div className="border-t border-current/25 pt-2.5 mt-2.5 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-neutral-400">Impacto Direto nas Metas:</p>
                    {simulationResult.delays.map((delay: string, idx: number) => (
                      <p 
                        key={idx} 
                        dangerouslySetInnerHTML={{ __html: delay }} 
                        className="text-[10px] text-neutral-300"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. Análise de Custos por Categoria (Gráfico Recharts de Barras Horizontais) */}
        <div className="brutal-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={16} className="text-brutal-green" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Ranqueamento de Gastos do Extrato
              </h3>
            </div>
            
            <p className="text-xs font-mono text-brutal-textMuted leading-relaxed mb-6">
              Visualização de barras para identificar instantaneamente as áreas que mais drenam suas economias mensais.
            </p>

            <div className="h-56 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData} 
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
                  >
                    <XAxis 
                      type="number" 
                      stroke="#9CA3AF" 
                      fontSize={9} 
                      fontFamily="JetBrains Mono"
                      tickLine={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#9CA3AF" 
                      fontSize={9} 
                      fontFamily="JetBrains Mono"
                      tickLine={false}
                      width={70}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#121216', 
                        borderColor: '#262626', 
                        color: '#FFF', 
                        fontFamily: 'JetBrains Mono',
                        fontSize: '10px',
                        borderRadius: '0px'
                      }}
                      formatter={(val: number) => [`R$ ${val.toFixed(2)}`, 'Gasto']}
                    />
                    <Bar dataKey="value" fill="#22C55E">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center font-mono text-xs text-brutal-textMuted">
                  Sem dados de despesas para gerar o ranqueamento.
                </div>
              )}
            </div>
          </div>

          {/* Dica da IA para ranqueamento */}
          {chartData.length > 0 && (
            <div className="border-t border-brutal-border pt-4 mt-4 font-mono text-[10px] text-brutal-textMuted flex gap-2">
              <span className="text-brutal-green font-bold">💡</span>
              <p>
                Gastos com **{chartData[0].name}** superam qualquer outra categoria. Concentrar esforços em monitorar as saídas nessa área trará retornos imediatos na sua sobra financeira mensal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
