/* ==========================================================================
   FinanAI - Core Application Script (Vanilla JS)
   ========================================================================== */

// 1. Chaves de Armazenamento Local
const KEYS = {
  TRANSACTIONS: 'finanai_transactions_v2',
  GOALS: 'finanai_goals_v2',
  PROFILE: 'finanai_profile_v2',
  CHAT: 'finanai_chat_v2'
};

// 2. Dados Iniciais de Demonstração (Caso localStorage esteja vazio)
const INITIAL_PROFILE = {
  name: 'Kaiky Botelho',
  monthlyBudgetLimit: 4500
};

const INITIAL_GOALS = [
  {
    id: 'goal-1',
    title: 'Reserva de Emergência',
    targetAmount: 15000,
    currentAmount: 8500,
    targetDate: '2026-12-31'
  },
  {
    id: 'goal-2',
    title: 'Notebook de Alta Performance',
    targetAmount: 8000,
    currentAmount: 3200,
    targetDate: '2026-09-30'
  }
];

const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const INITIAL_TRANSACTIONS = [
  { id: 't-1', description: 'Salário Principal', amount: 8500, type: 'income', category: 'Salário', date: getPastDate(20), notes: 'Salário CLT líquido' },
  { id: 't-2', description: 'Projeto Freelance UX/UI', amount: 1800, type: 'income', category: 'Freelance', date: getPastDate(12), notes: 'Criação de identidade visual' },
  { id: 't-3', description: 'Aluguel do Apartamento', amount: 2200, type: 'expense', category: 'Moradia', date: getPastDate(18), notes: 'Inclui condomínio' },
  { id: 't-4', description: 'Supermercado Mensal', amount: 984.5, type: 'expense', category: 'Alimentação', date: getPastDate(15), notes: 'Compra de suprimentos para o mês' },
  { id: 't-5', description: 'Combustível Ipiranga', amount: 320, type: 'expense', category: 'Transporte', date: getPastDate(14), notes: 'Tanque cheio' },
  { id: 't-6', description: 'Assinaturas (Netflix/Spotify)', amount: 149.9, type: 'expense', category: 'Lazer', date: getPastDate(10), notes: 'Débito automático' },
  { id: 't-7', description: 'Consulta Médica de Rotina', amount: 350, type: 'expense', category: 'Saúde', date: getPastDate(7), notes: 'Reembolso solicitado' },
  { id: 't-8', description: 'Jantar Restaurante Japonês', amount: 280, type: 'expense', category: 'Lazer', date: getPastDate(4), notes: 'Jantar com amigos' },
  { id: 't-9', description: 'Aporte de Cripto', amount: 500, type: 'expense', category: 'Outros', date: getPastDate(2), notes: 'Aporte mensal' }
];

const INITIAL_CHAT = [
  {
    id: 'c-1',
    sender: 'ai',
    text: 'Olá! Sou o assistente FinanAI. Estou aqui para analisar suas finanças em tempo real, dar insights de economia e simular impactos de gastos. Como posso te ajudar hoje?',
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
];

// 3. Estados Globais Reativos
let state = {
  transactions: [],
  goals: [],
  profile: { name: '', monthlyBudgetLimit: 0 },
  chatHistory: []
};

// Instâncias de gráficos globais Chart.js (para poder destruir e reconstruir)
let flowChartInstance = null;
let pieChartInstance = null;
let rankingChartInstance = null;

// Categorias e cores associadas
const CATEGORIES = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Salário', 'Freelance', 'Outros'];
const PIE_COLORS = ['#22C55E', '#EF4444', '#E5E5E5', '#A3A3A3', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

// ==========================================================================
// 4. Mecanismo de Inteligência Artificial Local (aiEngine)
// ==========================================================================
const aiEngine = {
  analyzeFinancialHealth() {
    const transactions = state.transactions;
    const goals = state.goals;
    const profile = state.profile;

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Agrupar gastos por categoria
    const categoryTotals = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    let highestCategory = 'Nenhuma';
    let highestCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([category, amount]) => {
      if (amount > highestCategoryAmount) {
        highestCategory = category;
        highestCategoryAmount = amount;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    let score = 'C';
    let scoreColor = 'text-green';
    if (savingsRate >= 30) {
      score = 'A+';
      scoreColor = 'text-green';
    } else if (savingsRate >= 20) {
      score = 'A';
      scoreColor = 'text-green';
    } else if (savingsRate >= 10) {
      score = 'B';
      scoreColor = 'text-green';
    } else if (savingsRate >= 0) {
      score = 'C';
      scoreColor = 'text-muted';
    } else {
      score = 'F';
      scoreColor = 'text-red';
    }

    const budgetPercentage = profile.monthlyBudgetLimit > 0
      ? (totalExpense / profile.monthlyBudgetLimit) * 100
      : 0;

    let budgetStatus = 'under';
    if (budgetPercentage > 100) {
      budgetStatus = 'over';
    } else if (budgetPercentage >= 85) {
      budgetStatus = 'near';
    }

    const recommendations = [];

    if (savingsRate < 10) {
      recommendations.push(
        `Sua taxa de economia é de apenas **${savingsRate.toFixed(1)}%**. Economistas recomendam poupar no mínimo 10% a 20% do seu ganho mensal.`
      );
    } else {
      recommendations.push(
        `Excelente! Você está poupando **${savingsRate.toFixed(1)}%** do seu salário, acima da média saudável.`
      );
    }

    if (highestCategoryAmount > 0) {
      const highestPercentage = totalExpense > 0 ? (highestCategoryAmount / totalExpense) * 100 : 0;
      recommendations.push(
        `Seu maior ralo de dinheiro é **${highestCategory}** (R$ ${highestCategoryAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}), representando **${highestPercentage.toFixed(1)}%** de todas as saídas. Reduzir 15% aqui traria **R$ ${(highestCategoryAmount * 0.15).toFixed(2)}** extras por mês.`
      );
    }

    if (budgetStatus === 'over') {
      recommendations.push(
        `⚠️ ATENÇÃO: Seu orçamento mensal de R$ ${profile.monthlyBudgetLimit} foi estourado em **${budgetPercentage.toFixed(1)}%**. Reduza gastos não essenciais imediatamente para evitar dívidas.`
      );
    } else if (budgetStatus === 'near') {
      recommendations.push(
        `Alerta: Você atingiu **${budgetPercentage.toFixed(1)}%** do seu limite orçamentário mensal de R$ ${profile.monthlyBudgetLimit}. Restam apenas **R$ ${(profile.monthlyBudgetLimit - totalExpense).toFixed(2)}** para gastar.`
      );
    }

    if (goals.length > 0) {
      const activeGoal = goals[0];
      const neededAmount = activeGoal.targetAmount - activeGoal.currentAmount;
      if (neededAmount > 0 && netSavings > 0) {
        const monthsToGoal = neededAmount / netSavings;
        recommendations.push(
          `No ritmo atual de poupança (R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês), você completará sua meta **${activeGoal.title}** em aproximadamente **${Math.ceil(monthsToGoal)} meses**.`
        );
      }
    } else {
      recommendations.push(
        'Você ainda não possui metas de poupança cadastradas! Crie uma meta na aba correspondente para manter o foco financeiro.'
      );
    }

    return {
      score,
      scoreColor,
      savingsRate,
      totalIncome,
      totalExpense,
      highestCategory,
      highestCategoryAmount,
      budgetStatus,
      budgetPercentage,
      recommendations
    };
  },

  generateAIResponse(userInput) {
    const input = userInput.toLowerCase();
    const transactions = state.transactions;
    const goals = state.goals;
    const profile = state.profile;

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense;

    // 1. Simulação de Compras
    if (input.includes('comprar') || input.includes('compra') || input.includes('simul')) {
      const match = input.match(/\d+([.,]\d+)?/g);
      if (match) {
        const valStr = match[0].replace(',', '.');
        const purchaseValue = parseFloat(valStr);
        
        if (purchaseValue > 0) {
          let response = `🤖 **Simulador de Decisão FinanAI:**\n\n`;
          response += `Você solicitou a simulação para uma compra no valor de **R$ ${purchaseValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.\n\n`;

          if (netSavings <= 0) {
            response += `🔴 **VEREDITO: RISCO CRÍTICO!**\n`;
            response += `Seu fluxo de caixa mensal atual está negativo ou empatado (Saldo do mês: R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). `;
            response += `Adquirir este item agora exigiria contrair dívidas ou usar reservas emergenciais de forma perigosa. **Recomendo adiar essa compra** até equilibrar suas despesas.`;
          } else {
            const monthsOfSavings = purchaseValue / netSavings;
            
            if (purchaseValue > netSavings * 3) {
              response += `🟡 **VEREDITO: RISCO MODERADO a ALTO**\n`;
              response += `Esta compra equivale a **${monthsOfSavings.toFixed(1)} meses de toda a sua sobra mensal média** (R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês).\n\n`;
              response += `Se for parcelar, certifique-se de que a parcela caiba em no máximo 10% da sua renda mensal. Se for comprar à vista, consumirá uma grande fração do seu poder de poupança atual.`;
            } else {
              response += `🟢 **VEREDITO: SEGURO**\n`;
              response += `Esta compra representa apenas **${(monthsOfSavings * 30).toFixed(0)} dias** de sua sobra de caixa acumulada. `;
              response += `Seu fluxo mensal de R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} suporta confortavelmente este gasto sem afetar suas economias essenciais de forma drástica.`;
            }
          }

          if (goals.length > 0) {
            const firstGoal = goals[0];
            const delayInMonths = purchaseValue / (netSavings > 0 ? netSavings : 1000);
            response += `\n\n*Nota sobre Metas:* Fazer esta compra à vista atrasaria seu progresso na meta **${firstGoal.title}** em aproximadamente **${delayInMonths.toFixed(1)} meses**, caso use a verba que seria direcionada à poupança.`;
          }
          
          return response;
        }
      }
      return '🤖 Para simular uma compra, por favor digite o valor estimado do produto. Por exemplo: *"Quero simular a compra de um celular de R$ 2500"*.';
    }

    // 2. Análise de Economia / Dicas para poupar
    if (input.includes('economizar') || input.includes('poupar') || input.includes('dicas') || input.includes('ajuda')) {
      const analysis = this.analyzeFinancialHealth();
      
      let response = `🤖 **Dicas de Otimização Financeira da FinanAI:**\n\n`;
      response += `Analisando seu extrato, vejo que sua maior categoria de gastos é **${analysis.highestCategory}** com um total de **R$ ${analysis.highestCategoryAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**.\n\n`;
      
      response += `Aqui estão 3 ações práticas com base nos seus dados:\n`;
      response += `1. **Corte Seletivo em ${analysis.highestCategory}:** Se você reduzir em apenas **15%** os gastos dessa categoria, economizará **R$ ${(analysis.highestCategoryAmount * 0.15).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** mensais.\n`;
      
      if (analysis.savingsRate < 20) {
        response += `2. **Ajuste do Limite Orçamentário:** Seu limite de gastos mensais está definido em R$ ${profile.monthlyBudgetLimit}. Sugiro abaixar esse teto em 10% no sistema para te desafiar a poupar mais ativamente.\n`;
      } else {
        response += `2. **Investimento das Sobras:** Como você já possui uma excelente taxa de economia (${analysis.savingsRate.toFixed(1)}%), recomendo automatizar a transferência dessa sobra para investimentos assim que receber seu salário.\n`;
      }

      if (goals.length > 0) {
        const goal = goals[0];
        response += `3. **Foco na Meta:** Direcione a economia acumulada na categoria *${analysis.highestCategory}* diretamente para a meta **${goal.title}**, acelerando sua conclusão em semanas.`;
      } else {
        response += `3. **Crie uma Meta:** Você não possui metas ativas. Cadastre seu primeiro objetivo financeiro para dar um propósito claro a cada centavo economizado!`;
      }

      return response;
    }

    // 3. Saúde Financeira / Score
    if (input.includes('saude') || input.includes('saúde') || input.includes('score') || input.includes('como estou') || input.includes('analis')) {
      const analysis = this.analyzeFinancialHealth();
      
      let response = `🤖 **Relatório Exclusivo de Saúde Financeira FinanAI:**\n\n`;
      response += `### Grade de Saúde: **${analysis.score}**\n\n`;
      response += `- **Sobra Mensal Real:** R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
      response += `- **Eficiência de Poupança (Savings Rate):** ${analysis.savingsRate.toFixed(1)}%\n`;
      response += `- **Maior Ralo de Dinheiro:** ${analysis.highestCategory} (R$ ${analysis.highestCategoryAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})\n`;
      response += `- **Compromisso de Limite:** ${analysis.budgetPercentage.toFixed(1)}% do orçamento consumido.\n\n`;
      
      response += `**Veredito:**\n`;
      if (analysis.score.startsWith('A')) {
        response += `🎉 Parabéns! Sua saúde financeira está em nível excepcional. Você gasta com sabedoria e retém uma parte muito alta das suas receitas. Continue assim!`;
      } else if (analysis.score === 'B') {
        response += `👍 Muito bom! Suas finanças estão saudáveis. Há espaço para pequenas otimizações, mas você está no caminho correto para atingir seus objetivos de longo prazo.`;
      } else if (analysis.score === 'C') {
        response += `⚠️ Alerta de Equilíbrio: Suas finanças estão estáveis, mas você está guardando pouco ou quase nada. Tente revisar despesas não essenciais (assinaturas, lazer descontrolado) para elevar sua taxa para pelo menos 15%.`;
      } else {
        response += `🚨 Risco de Endividamento: Você está gastando mais do que arrecada! Seu score de saúde é crítico. É fundamental suspender novos parcelamentos, renegociar despesas recorrentes e priorizar cortar gastos na categoria **${analysis.highestCategory}**.`;
      }

      return response;
    }

    // 4. Detalhamento por Categoria Específica
    for (const cat of ['alimentação', 'alimentacao', 'moradia', 'transporte', 'lazer', 'saúde', 'saude', 'salário', 'salario', 'freelance']) {
      if (input.includes(cat)) {
        const formalCat = cat.charAt(0).toUpperCase() + cat.slice(1)
          .replace('alimentacao', 'Alimentação')
          .replace('alimentação', 'Alimentação')
          .replace('saude', 'Saúde')
          .replace('saúde', 'Saúde')
          .replace('salario', 'Salário')
          .replace('salário', 'Salário');
        
        const catExpenses = transactions
          .filter((t) => t.category.toLowerCase().includes(cat.slice(0, 5)))
          .reduce((sum, t) => sum + t.amount, 0);

        if (catExpenses > 0) {
          return `🤖 **Análise de Categoria:**\n\nVocê já movimentou um total de **R$ ${catExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** em **${formalCat}** nas transações registradas no sistema.\n\nIsso representa **${((catExpenses / (totalExpense || 1)) * 100).toFixed(1)}%** do total de saídas do período.`;
        }
      }
    }

    // 5. Resposta Geral Padrão
    return `🤖 Entendi sua dúvida! Posso te ajudar a analisar suas finanças de forma muito específica. Tente me perguntar coisas como:\n\n` +
      `- *"Como posso economizar?"* (Para dicas personalizadas de corte de gastos)\n` +
      `- *"Minha saúde financeira está boa?"* (Para ver seu score de saúde de A+ a F)\n` +
      `- *"Simular compra de R$ 3200"* (Para calcular o impacto de uma nova despesa nas suas metas de economia)\n` +
      `- *"Quanto gastei com Lazer?"* (Para ver os totais gastos em categorias específicas)`;
  }
};

// ==========================================================================
// 5. Inicialização e Carregamento de Dados
// ==========================================================================
const initApp = () => {
  // Carregar ou inicializar localStorage
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    state.transactions = INITIAL_TRANSACTIONS;
  } else {
    state.transactions = JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS));
  }

  if (!localStorage.getItem(KEYS.GOALS)) {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
    state.goals = INITIAL_GOALS;
  } else {
    state.goals = JSON.parse(localStorage.getItem(KEYS.GOALS));
  }

  if (!localStorage.getItem(KEYS.PROFILE)) {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
    state.profile = INITIAL_PROFILE;
  } else {
    state.profile = JSON.parse(localStorage.getItem(KEYS.PROFILE));
  }

  if (!localStorage.getItem(KEYS.CHAT)) {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(INITIAL_CHAT));
    state.chatHistory = INITIAL_CHAT;
  } else {
    state.chatHistory = JSON.parse(localStorage.getItem(KEYS.CHAT));
  }

  // Renderizar a tela inteira pela primeira vez
  renderAll();
  setupEventListeners();
  
  // Garantir que ícones Lucide sejam processados
  lucide.createIcons();
};

// Salvar estados no localStorage
const saveState = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ==========================================================================
// 6. Funções de Renderização (Reatividade DOM)
// ==========================================================================
const renderAll = () => {
  const analysis = aiEngine.analyzeFinancialHealth();
  const totalBalance = analysis.totalIncome - analysis.totalExpense;

  // 1. Atualizar Perfil no Menu Lateral e Displays
  document.getElementById('user-name').innerText = state.profile.name;
  document.getElementById('mobile-user-name').innerText = state.profile.name;
  document.getElementById('user-budget-display').innerText = `R$ ${state.profile.monthlyBudgetLimit.toLocaleString('pt-BR')}`;
  
  // Preencher formulário de perfil com os valores corretos
  document.getElementById('prof-name').value = state.profile.name;
  document.getElementById('prof-budget').value = state.profile.monthlyBudgetLimit;

  // 2. Atualizar Cards de Métricas Gerais (Dashboard)
  document.getElementById('metric-balance').innerText = totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('metric-income').innerText = analysis.totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('metric-expense').innerText = analysis.totalExpense.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  const budgetSub = document.getElementById('metric-expense-sub');
  if (analysis.budgetPercentage > 0) {
    budgetSub.innerText = `${analysis.budgetPercentage.toFixed(0)}% do orçamento de R$ ${state.profile.monthlyBudgetLimit} gasto`;
  } else {
    budgetSub.innerText = 'Sem limite orçamentário definido';
  }

  document.getElementById('metric-savings-rate').innerText = `${analysis.savingsRate.toFixed(0)}%`;
  
  const healthScoreDisplay = document.getElementById('metric-health-score');
  healthScoreDisplay.innerText = `(${analysis.score})`;
  healthScoreDisplay.className = `text-base font-bold font-mono ${analysis.scoreColor}`;

  // 3. Renderizar Recomendações de IA no Dashboard
  const insightsContainer = document.getElementById('dashboard-ai-insights');
  insightsContainer.innerHTML = '';
  analysis.recommendations.slice(0, 2).forEach((rec) => {
    // Formatar texto com tags strong para negrito
    let formatted = rec.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
    insightsContainer.innerHTML += `
      <div class="ai-insight-item">
        <span class="ai-insight-bullet">▶</span>
        <p class="ai-insight-text">${formatted}</p>
      </div>
    `;
  });

  // 4. Renderizar Gráficos (Chart.js)
  renderCharts();

  // 5. Renderizar Resumos (Dashboard) e Telas Estáticas
  renderDashboardSummaries(totalBalance);
  renderLedgerTable();
  renderGoalsGrid(analysis.totalIncome - analysis.totalExpense);
  renderChatMessages();

  // Reprocessar ícones Lucide nos elementos criados dinamicamente
  lucide.createIcons();
};

// Renderização dos resumos rápidos no Dashboard
const renderDashboardSummaries = (netSavings) => {
  // Transações recentes
  const recentTransactionsContainer = document.getElementById('dashboard-recent-transactions');
  recentTransactionsContainer.innerHTML = '';
  
  const sorted = [...state.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  sorted.forEach((t) => {
    const badgeColor = t.type === 'income' ? '#22C55E' : '#EF4444';
    const badgeBorder = t.type === 'income' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
    const textSign = t.type === 'income' ? '+' : '-';
    const textColor = t.type === 'income' ? 'text-green' : 'text-red';

    recentTransactionsContainer.innerHTML += `
      <div class="flex items-center justify-between p-3 border border-brutal-border bg-brutal-panel-light">
        <div>
          <h4 class="text-xs font-semibold font-mono text-white">${t.description}</h4>
          <div class="flex items-center gap-2 mt-1.5">
            <span class="brutal-badge" style="color: ${badgeColor}; border-color: ${badgeBorder}">${t.category}</span>
            <span class="text-[10px] font-mono text-muted">${new Date(t.date).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <span class="font-mono text-xs font-bold ${textColor}">${textSign} R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
    `;
  });

  if (sorted.length === 0) {
    recentTransactionsContainer.innerHTML = '<div class="text-center py-6 font-mono text-xs text-muted">Nenhuma transação cadastrada.</div>';
  }

  // Metas recentes
  const activeGoalsContainer = document.getElementById('dashboard-active-goals');
  activeGoalsContainer.innerHTML = '';

  state.goals.slice(0, 2).forEach((goal) => {
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const needed = goal.targetAmount - goal.currentAmount;
    const monthsToComplete = netSavings > 0 ? needed / netSavings : Infinity;

    let timeText = '';
    if (percentage >= 100) {
      timeText = '<span class="text-green">Completa!</span>';
    } else if (monthsToComplete === Infinity || monthsToComplete < 0) {
      timeText = '<span class="text-red">Sem poupança</span>';
    } else {
      timeText = `Restam ~${Math.ceil(monthsToComplete)} meses`;
    }

    activeGoalsContainer.innerHTML += `
      <div class="p-4 border border-brutal-border bg-brutal-panel-light">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h4 class="text-xs font-bold font-mono text-white uppercase">${goal.title}</h4>
            ${goal.targetDate ? `<p class="text-[9px] font-mono text-muted uppercase mt-0.5">Alvo: ${new Date(goal.targetDate).toLocaleDateString('pt-BR')}</p>` : ''}
          </div>
          <span class="text-xs font-bold font-mono text-green">${percentage.toFixed(0)}%</span>
        </div>
        
        <div class="progress-bar-container mb-3">
          <div class="progress-bar-fill" style="width: ${percentage}%"></div>
        </div>

        <div class="flex justify-between items-center text-[10px] font-mono border-top pt-2 border-border-light">
          <span class="text-muted">R$ ${goal.currentAmount.toLocaleString('pt-BR')} / R$ ${goal.targetAmount.toLocaleString('pt-BR')}</span>
          <span class="text-neutral-400 font-bold">${timeText}</span>
        </div>
      </div>
    `;
  });

  if (state.goals.length === 0) {
    activeGoalsContainer.innerHTML = '<div class="text-center py-8 font-mono text-xs text-muted">Nenhuma meta criada ainda.</div>';
  }
};

// Renderização dos Gráficos Interativos (Chart.js)
const renderCharts = () => {
  // 1. Gráfico de Fluxo de Caixa (Dashboard)
  const flowCtx = document.getElementById('flowChart').getContext('2d');
  
  // Agrupar as transações recentes por data
  const chartData = [...state.transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-8);

  const labels = chartData.map(t => new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
  const incomes = chartData.map(t => t.type === 'income' ? t.amount : 0);
  const expenses = chartData.map(t => t.type === 'expense' ? t.amount : 0);

  if (flowChartInstance) {
    flowChartInstance.destroy();
  }

  flowChartInstance = new Chart(flowCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Receitas',
          data: incomes,
          borderColor: '#22C55E',
          backgroundColor: 'rgba(34, 197, 94, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        },
        {
          label: 'Despesas',
          data: expenses,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#FFFFFF', font: { family: 'JetBrains Mono', size: 10 } }
        }
      },
      scales: {
        x: {
          grid: { color: '#1F1F23' },
          ticks: { color: '#A3A3A3', font: { family: 'JetBrains Mono', size: 9 } }
        },
        y: {
          grid: { color: '#1F1F23' },
          ticks: { color: '#A3A3A3', font: { family: 'JetBrains Mono', size: 9 } }
        }
      }
    }
  });

  // 2. Gráfico de Rosca de Categorias (Dashboard)
  const pieCtx = document.getElementById('pieChart').getContext('2d');
  
  const categoryTotals = {};
  state.transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  const pieLabels = Object.keys(categoryTotals);
  const pieValues = Object.values(categoryTotals);

  if (pieChartInstance) {
    pieChartInstance.destroy();
  }

  pieChartInstance = new Chart(pieCtx, {
    type: 'doughnut',
    data: {
      labels: pieLabels,
      datasets: [{
        data: pieValues,
        backgroundColor: PIE_COLORS,
        borderColor: '#121216',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      cutout: '65%'
    }
  });

  // Renderizar legenda do gráfico de rosca
  const legendContainer = document.getElementById('dashboard-pie-legend');
  legendContainer.innerHTML = '';
  pieLabels.slice(0, 4).forEach((name, idx) => {
    const val = pieValues[idx];
    legendContainer.innerHTML += `
      <div class="legend-item">
        <div class="legend-color" style="background-color: ${PIE_COLORS[idx % PIE_COLORS.length]}"></div>
        <span class="text-muted truncate mr-1">${name}:</span>
        <span class="text-white font-bold">R$ ${val.toFixed(0)}</span>
      </div>
    `;
  });

  // 3. Gráfico de Ranqueamento Horizontal de Gastos (Relatórios)
  const rankingCtx = document.getElementById('rankingChart').getContext('2d');
  
  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);

  const rankLabels = sortedCategories.map(c => c[0]);
  const rankValues = sortedCategories.map(c => c[1]);

  if (rankingChartInstance) {
    rankingChartInstance.destroy();
  }

  rankingChartInstance = new Chart(rankingCtx, {
    type: 'bar',
    data: {
      labels: rankLabels,
      datasets: [{
        data: rankValues,
        backgroundColor: PIE_COLORS,
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: '#1F1F23' },
          ticks: { color: '#A3A3A3', font: { family: 'JetBrains Mono', size: 8 } }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#A3A3A3', font: { family: 'JetBrains Mono', size: 8 } }
        }
      }
    }
  });

  // Renders de recomendações de relatórios
  const rankingAIBox = document.getElementById('ranking-ai-insight');
  if (sortedCategories.length > 0) {
    rankingAIBox.innerHTML = `
      <span class="text-green font-bold">💡</span>
      <p>Gastos com **${sortedCategories[0][0]}** superam qualquer outra categoria. Concentrar esforços em monitorar as saídas nessa área trará retornos imediatos na sua sobra financeira mensal.</p>
    `;
    // Formatar negritos no JS
    rankingAIBox.querySelector('p').innerHTML = rankingAIBox.querySelector('p').innerHTML.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
  } else {
    rankingAIBox.innerHTML = '<span class="text-muted font-mono">Sem dados de despesas suficientes para diagnósticos.</span>';
  }
};

// Renderização da Tabela de Transações Completa (Ledger)
const renderLedgerTable = () => {
  const tbody = document.getElementById('ledger-tbody');
  tbody.innerHTML = '';

  const search = document.getElementById('filter-search').value.toLowerCase();
  const cat = document.getElementById('filter-category').value;
  const activeTypeBtn = document.querySelector('.btn-tabs-container .tab-btn.active');
  const type = activeTypeBtn ? activeTypeBtn.getAttribute('data-type') : 'All';

  const filtered = state.transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(search) || (t.notes && t.notes.toLowerCase().includes(search));
    const matchesCategory = cat === 'Todas' || t.category === cat;
    const matchesType = type === 'All' || t.type === type;
    return matchesSearch && matchesCategory && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Atualizar contadores
  document.getElementById('txt-total-t').innerText = state.transactions.length;
  document.getElementById('txt-filtered-t').innerText = filtered.length;

  filtered.forEach((t) => {
    const badgeColor = t.type === 'income' ? '#4ADE80' : '#EF4444';
    const badgeBorder = t.type === 'income' ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)';
    const sign = t.type === 'income' ? '+' : '-';
    const valClass = t.type === 'income' ? 'text-green' : 'text-red';

    tbody.innerHTML += `
      <tr class="hover:bg-brutal-panel-light transition-colors">
        <td class="px-6 py-4 whitespace-nowrap text-muted">${new Date(t.date).toLocaleDateString('pt-BR')}</td>
        <td class="px-6 py-4">
          <span class="font-bold text-white block">${t.description}</span>
          ${t.notes ? `<span class="text-[10px] text-muted block mt-0.5">${t.notes}</span>` : ''}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="brutal-badge" style="color: ${badgeColor}; border-color: ${badgeBorder}">${t.category}</span>
        </td>
        <td class="px-6 py-4 text-right font-bold whitespace-nowrap font-mono ${valClass}">${sign} R$ ${t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td class="px-6 py-4 text-center whitespace-nowrap">
          <div class="flex items-center justify-center gap-3">
            <button onclick="handleOpenEditTransaction('${t.id}')" class="btn-icon hover:text-green cursor-pointer" title="Editar"><i data-lucide="edit-3" style="width: 14px; height: 14px"></i></button>
            <button onclick="handleDeleteTransaction('${t.id}')" class="btn-icon hover:text-red cursor-pointer" title="Excluir"><i data-lucide="trash-2" style="width: 14px; height: 14px"></i></button>
          </div>
        </td>
      </tr>
    `;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-10 text-muted font-mono text-xs">
          Nenhuma transação correspondente aos filtros.
        </td>
      </tr>
    `;
  }
};

// Renderização do Grid de Metas
const renderGoalsGrid = (netSavings) => {
  const container = document.getElementById('goals-grid-container');
  container.innerHTML = '';

  // Atualizar cabeçalho superior do painel de metas
  document.getElementById('goals-savings-display').innerText = `R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  const goalsBadge = document.getElementById('goals-status-badge');
  if (netSavings > 0) {
    goalsBadge.innerText = '🚀 Poupança ativa estável';
    goalsBadge.className = 'font-mono text-[10px] uppercase bg-brutal-panel-light border border-brutal-border px-3 py-1.5 text-green';
  } else {
    goalsBadge.innerText = '⚠️ Caixa zerado dificulta metas';
    goalsBadge.className = 'font-mono text-[10px] uppercase bg-brutal-panel-light border border-brutal-border px-3 py-1.5 text-red';
  }

  state.goals.forEach((goal) => {
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const isCompleted = percentage >= 100;
    
    const needed = goal.targetAmount - goal.currentAmount;
    const monthsToComplete = netSavings > 0 ? needed / netSavings : Infinity;

    let iaVerdict = '';
    if (isCompleted) {
      iaVerdict = '<span class="text-green font-bold">🎉 Meta conquistada com sucesso!</span>';
    } else if (monthsToComplete === Infinity || monthsToComplete < 0) {
      iaVerdict = '<span class="text-red font-bold">Sua sobra de caixa atual é negativa. Ajuste o fluxo mensal para simular projeções.</span>';
    } else {
      iaVerdict = `Com a economia de R$ ${netSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/mês, restam aproximadamente **${Math.ceil(monthsToComplete)} meses** para conclusão.`;
    }

    container.innerHTML += `
      <div class="brutal-card flex flex-col justify-between" style="border-top: 4px solid ${isCompleted ? '#22C55E' : 'rgba(74,222,128,0.2)'}">
        <div>
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-mono text-sm font-bold uppercase text-white tracking-wider">${goal.title}</h3>
              ${goal.targetDate ? `
                <div class="flex items-center gap-1.5 text-[9px] font-mono text-muted uppercase mt-1">
                  <i data-lucide="calendar" style="width: 10px; height: 10px;"></i>
                  <span>Previsão: ${new Date(goal.targetDate).toLocaleDateString('pt-BR')}</span>
                </div>
              ` : ''}
            </div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-green">${percentage.toFixed(1)}%</span>
              <button onclick="handleDeleteGoal('${goal.id}')" class="btn-icon hover:text-red cursor-pointer" title="Excluir Meta"><i data-lucide="trash-2" style="width: 13px; height: 13px"></i></button>
            </div>
          </div>

          <div class="progress-bar-container mb-4">
            <div class="progress-bar-fill" style="width: ${percentage}%"></div>
          </div>

          <div class="flex justify-between items-baseline text-xs font-mono mb-4">
            <span class="text-muted">Acumulado:</span>
            <span class="text-white font-bold">R$ ${goal.currentAmount.toLocaleString('pt-BR')} <span class="text-muted font-normal">/ R$ ${goal.targetAmount.toLocaleString('pt-BR')}</span></span>
          </div>
        </div>

        <div class="border-top pt-4 mt-2 space-y-3">
          <div class="goal-predict-box">
            <span class="text-green font-bold">★ ANÁLISE PREDITIVA IA:</span>
            <p class="text-neutral-300 mt-1">${iaVerdict.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')}</p>
          </div>
          
          ${!isCompleted ? `
            <button onclick="handleOpenAporteModal('${goal.id}', '${goal.title.replace(/'/g, "\\'")}')" class="w-full btn-secondary py-1.5 gap-2"><i data-lucide="coins" class="text-green" style="width: 12px; height: 12px"></i> Registrar Aporte</button>
          ` : ''}
        </div>
      </div>
    `;
  });

  if (state.goals.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-20 brutal-card">
        <i data-lucide="target" class="mx-auto text-muted mb-3" style="width: 32px; height: 32px"></i>
        <h3 class="font-mono text-sm font-bold uppercase text-white">Nenhuma meta cadastrada</h3>
        <p class="font-mono text-xs text-muted max-w-sm mx-auto mt-2 leading-relaxed">
          Crie objetivos de economia (compra de eletrônicos, reserva de emergência, viagens) para receber análises analíticas de conclusão.
        </p>
      </div>
    `;
  }
};

// Renderização da conversa do Chat de IA
const renderChatMessages = () => {
  const feed = document.getElementById('chat-messages-feed');
  feed.innerHTML = '';

  state.chatHistory.forEach((msg) => {
    const isAI = msg.sender === 'ai';
    const avatarIcon = isAI ? 'bot' : 'user';
    const avatarClass = isAI ? 'ai' : 'user';
    const bubbleClass = isAI ? '' : '';

    let textContent = msg.text;
    if (isAI) {
      // Processar quebras de linha e formatações de IA nativas no Javascript
      textContent = textContent.split('\n').map((paragraph) => {
        let formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-mono">$1</strong>');
        if (formatted.startsWith('### ')) {
          return `<h4 class="text-sm font-bold font-mono text-green uppercase tracking-wider mt-4 mb-2">${formatted.replace('### ', '')}</h4>`;
        }
        if (formatted.startsWith('- ') || formatted.startsWith('* ')) {
          return `<li class="list-none pl-4 text-neutral-300 font-mono text-xs mb-1.5 relative"><span class="absolute left-0 text-green">▪</span><span>${formatted.slice(2)}</span></li>`;
        }
        return `<p class="text-xs text-neutral-300 font-mono leading-relaxed mb-2">${formatted}</p>`;
      }).join('');
    } else {
      textContent = `<p class="text-xs font-mono text-white leading-relaxed">${msg.text}</p>`;
    }

    feed.innerHTML += `
      <div class="msg-wrap ${avatarClass} animate-fade">
        <div class="chat-avatar ${avatarClass}"><i data-lucide="${avatarIcon}" style="width: 15px; height: 15px;"></i></div>
        <div class="chat-bubble border rounded-none">
          <div>${textContent}</div>
          <span class="chat-time uppercase">${msg.timestamp}</span>
        </div>
      </div>
    `;
  });
};

// ==========================================================================
// 7. Handlers de Eventos e Ações (Interatividade)
// ==========================================================================
const setupEventListeners = () => {
  
  // === Roteador SPA de Abas ===
  document.querySelectorAll('[data-target]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      
      // Mudar classes ativas nos menus
      document.querySelectorAll('[data-target]').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-target') === target) b.classList.add('active');
      });

      // Fechar menu mobile se tiver aberto
      document.getElementById('mobile-nav-dropdown').classList.add('hidden');

      // Tocar visualizadores de seção
      document.querySelectorAll('section.panel').forEach((section) => {
        section.classList.remove('block');
        section.classList.add('hidden');
      });
      document.getElementById(`panel-${target}`).classList.remove('hidden');
      document.getElementById(`panel-${target}`).classList.add('block');

      // Reprocessar gráficos na aba relatórios/dashboard
      if (target === 'dashboard' || target === 'reports') {
        renderCharts();
      }

      // Lucide icons
      lucide.createIcons();
    });
  });

  // Hamburguer menu mobile
  document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
    document.getElementById('mobile-nav-dropdown').classList.toggle('hidden');
  });

  // Atalhos Rápidos da IA
  document.querySelectorAll('#chat-quick-questions button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const text = e.currentTarget.getAttribute('data-text');
      handleSendChatMessage(text);
    });
  });

  // Botões de navegação rápida (Ex: "Ver tudo")
  document.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-goto');
      document.querySelector(`[data-target="${target}"]`).click();
    });
  });

  // === Modais Gerais Open/Close ===
  const closeModals = () => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
  };

  document.querySelectorAll('.btn-close, .btn-close-modal').forEach(b => {
    b.addEventListener('click', closeModals);
  });

  // Ajustar Perfil
  const openProfileModal = () => {
    document.getElementById('modal-profile').classList.remove('hidden');
  };
  document.getElementById('btn-desktop-profile').addEventListener('click', openProfileModal);
  document.getElementById('btn-mobile-profile').addEventListener('click', openProfileModal);

  document.getElementById('form-profile').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('prof-name').value;
    const budget = parseFloat(document.getElementById('prof-budget').value) || 0;
    
    state.profile = { name, monthlyBudgetLimit: budget };
    saveState(KEYS.PROFILE, state.profile);
    
    closeModals();
    renderAll();
  });

  // Nova Transação (Formulários)
  const openNewTransaction = () => {
    document.getElementById('tx-id').value = '';
    document.getElementById('tx-modal-title').innerText = 'Cadastrar Movimentação';
    document.getElementById('tx-description').value = '';
    document.getElementById('tx-amount').value = '';
    document.getElementById('tx-notes').value = '';
    document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
    
    // Default: Saída
    handleSetTransactionType('expense');

    document.getElementById('modal-transaction').classList.remove('hidden');
  };

  document.getElementById('btn-dash-new-t').addEventListener('click', openNewTransaction);
  document.getElementById('btn-ledger-new-t').addEventListener('click', openNewTransaction);

  // Tipo de transação modal
  document.getElementById('btn-tx-income').addEventListener('click', () => handleSetTransactionType('income'));
  document.getElementById('btn-tx-expense').addEventListener('click', () => handleSetTransactionType('expense'));

  const handleSetTransactionType = (type) => {
    const incBtn = document.getElementById('btn-tx-income');
    const expBtn = document.getElementById('btn-tx-expense');
    
    if (type === 'income') {
      incBtn.className = 'py-2 text-xs font-mono uppercase font-bold tracking-wider text-center select-none active-btn text-black bg-brutal-green w-full';
      expBtn.className = 'py-2 text-xs font-mono uppercase font-bold tracking-wider text-center select-none text-muted w-full';
      incBtn.setAttribute('data-active', 'true');
      expBtn.setAttribute('data-active', 'false');
    } else {
      incBtn.className = 'py-2 text-xs font-mono uppercase font-bold tracking-wider text-center select-none text-muted w-full';
      expBtn.className = 'py-2 text-xs font-mono uppercase font-bold tracking-wider text-center select-none active-btn-red text-white bg-brutal-red w-full';
      incBtn.setAttribute('data-active', 'false');
      expBtn.setAttribute('data-active', 'true');
    }
  };

  // Submissão do Formulário de Transações (Cadastro / Edição)
  document.getElementById('form-transaction').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('tx-id').value;
    const description = document.getElementById('tx-description').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const category = document.getElementById('tx-category').value;
    const date = document.getElementById('tx-date').value;
    const notes = document.getElementById('tx-notes').value;
    
    const isIncome = document.getElementById('btn-tx-income').getAttribute('data-active') === 'true';
    const type = isIncome ? 'income' : 'expense';

    if (isNaN(amount) || amount <= 0) return;

    if (id) {
      // Editar
      state.transactions = state.transactions.map((t) => 
        t.id === id ? { id, description, amount, type, category, date, notes } : t
      );
    } else {
      // Adicionar
      const newT = {
        id: `t-${Date.now()}`,
        description,
        amount,
        type,
        category,
        date,
        notes: notes || undefined
      };
      state.transactions.unshift(newT);
    }

    saveState(KEYS.TRANSACTIONS, state.transactions);
    closeModals();
    renderAll();
  });

  // Filtros Ledger dinâmicos
  document.getElementById('filter-search').addEventListener('input', renderLedgerTable);
  document.getElementById('filter-category').addEventListener('change', renderLedgerTable);
  document.getElementById('btn-clear-filters').addEventListener('click', () => {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-category').value = 'Todas';
    document.querySelectorAll('.btn-tabs-container .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.btn-tabs-container [data-type="All"]').classList.add('active');
    renderLedgerTable();
  });

  // Abas de tipo ledger
  document.querySelectorAll('.btn-tabs-container .tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.btn-tabs-container .tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      renderLedgerTable();
    });
  });

  // Nova Meta
  document.getElementById('btn-goals-new-g').addEventListener('click', () => {
    document.getElementById('g-title').value = '';
    document.getElementById('g-target').value = '';
    document.getElementById('g-current').value = '';
    document.getElementById('g-date').value = '';
    document.getElementById('modal-goal').classList.remove('hidden');
  });

  document.getElementById('form-goal').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('g-title').value;
    const target = parseFloat(document.getElementById('g-target').value);
    const current = parseFloat(document.getElementById('g-current').value) || 0;
    const targetDate = document.getElementById('g-date').value;

    if (isNaN(target) || target <= 0) return;

    const newG = {
      id: `goal-${Date.now()}`,
      title,
      targetAmount: target,
      currentAmount: current,
      targetDate: targetDate || undefined
    };

    state.goals.push(newG);
    saveState(KEYS.GOALS, state.goals);
    closeModals();
    renderAll();
  });

  // Registrar Aporte de Meta
  document.getElementById('form-aporte').addEventListener('submit', (e) => {
    e.preventDefault();
    const goalId = document.getElementById('aporte-goal-id').value;
    const goalTitle = document.getElementById('aporte-goal-title').innerText;
    const amount = parseFloat(document.getElementById('aporte-amount').value);

    if (isNaN(amount) || amount <= 0) return;

    // 1. Atualizar Meta
    state.goals = state.goals.map((g) => 
      g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
    );
    saveState(KEYS.GOALS, state.goals);

    // 2. Criar Transação de Despesa Automática Coesa
    const autoT = {
      id: `t-auto-${Date.now()}`,
      description: `Aporte Meta: ${goalTitle}`,
      amount: amount,
      type: 'expense',
      category: 'Outros',
      date: new Date().toISOString().split('T')[0],
      notes: 'Aporte transferido localmente para a meta de economia.'
    };
    state.transactions.unshift(autoT);
    saveState(KEYS.TRANSACTIONS, state.transactions);

    closeModals();
    renderAll();
  });

  // Chat Envio Form
  document.getElementById('chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = document.getElementById('chat-input').value;
    handleSendChatMessage(text);
  });

  // Limpar histórico do Chat
  document.getElementById('btn-clear-chat').addEventListener('click', () => {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(INITIAL_CHAT));
    state.chatHistory = INITIAL_CHAT;
    renderChatMessages();
    lucide.createIcons();
  });

  // Botão atalhos IA dashboard
  document.getElementById('btn-dash-ask-ai').addEventListener('click', () => {
    document.querySelector('[data-target="chat"]').click();
  });

  // Simulador de Decisão de Compras
  document.getElementById('btn-sim-cash').addEventListener('click', () => {
    document.getElementById('btn-sim-cash').className = 'flex-1 text-[10px] uppercase font-mono py-1.5 text-center active-btn select-none';
    document.getElementById('btn-sim-parcels').className = 'flex-1 text-[10px] uppercase font-mono py-1.5 text-center text-muted select-none';
    document.getElementById('sim-parcels-area').classList.add('hidden');
    setIsParceladoSim(false);
  });

  document.getElementById('btn-sim-parcels').addEventListener('click', () => {
    document.getElementById('btn-sim-cash').className = 'flex-1 text-[10px] uppercase font-mono py-1.5 text-center text-muted select-none';
    document.getElementById('btn-sim-parcels').className = 'flex-1 text-[10px] uppercase font-mono py-1.5 text-center active-btn select-none';
    document.getElementById('sim-parcels-area').classList.remove('hidden');
    setIsParceladoSim(true);
  });

  let isParceladoSim = false;
  const setIsParceladoSim = (val) => { isParceladoSim = val; };

  document.getElementById('simulator-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const itemName = document.getElementById('sim-item-name').value;
    const val = parseFloat(document.getElementById('sim-item-value').value);
    const parcelsCount = parseInt(document.getElementById('sim-parcels-count').value);

    if (isNaN(val) || val <= 0) return;

    const analysis = aiEngine.analyzeFinancialHealth();
    const netSavings = analysis.totalIncome - analysis.totalExpense;

    let verdictText = 'SEGURO';
    let verdictColor = 'border-brutal-green text-green bg-brutal-green/5 shadow-neon-green';
    let verdictIcon = '<i data-lucide="check-circle" class="text-green" style="width: 24px; height: 24px"></i>';
    
    const monthlyCost = isParceladoSim ? (val / parcelsCount) : val;

    if (netSavings <= 0 || (isParceladoSim && monthlyCost > netSavings)) {
      verdictText = 'RISCO CRÍTICO';
      verdictColor = 'border-red text-red bg-brutal-red/5 shadow-neon-red';
      verdictIcon = '<i data-lucide="alert-triangle" class="text-red" style="width: 24px; height: 24px"></i>';
    } else if (val > netSavings * 3) {
      verdictText = 'RISCO MODERADO';
      verdictColor = 'border-yellow-500 text-yellow-500 bg-yellow-500/5 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
      verdictIcon = '<i data-lucide="alert-triangle" class="text-yellow-500" style="width: 24px; height: 24px"></i>';
    }

    // Calcular atraso de metas
    const delays = [];
    if (state.goals.length > 0) {
      state.goals.forEach(goal => {
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining > 0 && netSavings > 0) {
          const currentMonths = remaining / netSavings;
          const newSavings = netSavings - (isParceladoSim ? monthlyCost : 0);
          
          if (newSavings > 0) {
            const newMonths = isParceladoSim 
              ? (remaining / newSavings) 
              : ((remaining + val) / netSavings);
            
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

    const percentageOfSavings = netSavings > 0 ? (monthlyCost / netSavings) * 100 : 100;

    let delaysHTML = '';
    if (delays.length > 0) {
      delaysHTML = `
        <div class="border-top pt-2.5 mt-2.5 space-y-1" style="border-color: currentColor">
          <p class="text-[10px] uppercase font-bold text-neutral-400">Impacto Direto nas Metas:</p>
          ${delays.map(d => `<p class="text-[10px] text-neutral-300">${d.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`).join('')}
        </div>
      `;
    }

    const outputBox = document.getElementById('simulation-output');
    outputBox.className = `mt-6 border p-4 block animate-fade ${verdictColor}`;
    outputBox.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        ${verdictIcon}
        <div>
          <p class="text-[10px] font-mono uppercase tracking-wider text-muted">Veredito FinanAI</p>
          <h4 class="text-sm font-bold font-mono uppercase">${verdictText}</h4>
        </div>
      </div>

      <div class="font-mono text-xs text-neutral-200 space-y-2 border-top pt-3" style="border-color: currentColor">
        <p>
          A aquisição do item **${itemName}** no valor de **R$ ${val.toLocaleString('pt-BR')}** 
          ${isParceladoSim 
            ? ` parcelado em ${parcelsCount}x custará **R$ ${monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês**.`
            : ' à vista consumirá o valor total de uma única vez.'}
        </p>

        ${netSavings > 0 ? `
          <p>Isso representa **${percentageOfSavings.toFixed(1)}%** de toda a sua poupança líquida mensal (R$ ${netSavings.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}).</p>
        ` : `
          <p class="text-red font-bold">⚠️ Seu saldo mensal atual está deficitário, o que torna esta compra inviável sem contrair juros.</p>
        `}

        ${delaysHTML}
      </div>
    `;

    lucide.createIcons();
  });
};

// Enviar Mensagem do Chat
const handleSendChatMessage = (text) => {
  if (!text.trim()) return;

  // 1. Adicionar mensagem do usuário
  const userMsg = {
    id: `c-u-${Date.now()}`,
    sender: 'user',
    text: text,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };

  state.chatHistory.push(userMsg);
  saveState(KEYS.CHAT, state.chatHistory);
  document.getElementById('chat-input').value = '';
  renderChatMessages();
  
  // Auto-scroll
  const feed = document.getElementById('chat-messages-feed');
  feed.scrollTop = feed.scrollHeight;

  // Reprocessar lucide
  lucide.createIcons();

  // 2. Simular carregamento/digitação da IA
  const typingLoaderHTML = `
    <div id="chat-typing-loader-box" class="flex gap-3 mr-auto items-center animate-pulse">
      <div class="chat-avatar ai border border-brutal-green"><i data-lucide="bot" style="width: 15px; height: 15px;"></i></div>
      <div class="p-3 border border-brutal-border bg-brutal-panel font-mono text-[10px] text-green">
        <span>● FinanAI está lendo seu banco de dados e processando insights...</span>
      </div>
    </div>
  `;
  feed.innerHTML += typingLoaderHTML;
  feed.scrollTop = feed.scrollHeight;
  lucide.createIcons();

  setTimeout(() => {
    // Excluir loader
    const loaderBox = document.getElementById('chat-typing-loader-box');
    if (loaderBox) loaderBox.remove();

    // Obter resposta do motor analítico
    const aiResponseText = aiEngine.generateAIResponse(text);
    
    const aiMsg = {
      id: `c-a-${Date.now()}`,
      sender: 'ai',
      text: aiResponseText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    state.chatHistory.push(aiMsg);
    saveState(KEYS.CHAT, state.chatHistory);
    renderChatMessages();
    feed.scrollTop = feed.scrollHeight;
    lucide.createIcons();
  }, 750); // Simulação de delay analítico local
};

// ==========================================================================
// 8. Funções Públicas Vinculadas ao escopo Global (Para cliques inline do HTML)
// ==========================================================================
window.handleDeleteTransaction = (id) => {
  if (confirm('Deseja realmente excluir esta transação?')) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveState(KEYS.TRANSACTIONS, state.transactions);
    renderAll();
  }
};

window.handleOpenEditTransaction = (id) => {
  const t = state.transactions.find(x => x.id === id);
  if (!t) return;

  document.getElementById('tx-id').value = t.id;
  document.getElementById('tx-modal-title').innerText = 'Editar Lançamento';
  document.getElementById('tx-description').value = t.description;
  document.getElementById('tx-amount').value = t.amount;
  document.getElementById('tx-category').value = t.category;
  document.getElementById('tx-date').value = t.date;
  document.getElementById('tx-notes').value = t.notes || '';
  
  handleSetTransactionType(t.type);

  document.getElementById('modal-transaction').classList.remove('hidden');
  lucide.createIcons();
};

window.handleDeleteGoal = (id) => {
  if (confirm('Deseja realmente excluir esta meta de economia?')) {
    state.goals = state.goals.filter(g => g.id !== id);
    saveState(KEYS.GOALS, state.goals);
    renderAll();
  }
};

window.handleOpenAporteModal = (id, title) => {
  document.getElementById('aporte-goal-id').value = id;
  document.getElementById('aporte-goal-title').innerText = title;
  document.getElementById('aporte-amount').value = '';
  document.getElementById('modal-aporte').classList.remove('hidden');
};

// Ajuste rápido de funções do seletor de tipo de transação (inline no modal)
const handleSetTransactionType = (type) => {
  const incBtn = document.getElementById('btn-tx-income');
  const expBtn = document.getElementById('btn-tx-expense');
  
  if (type === 'income') {
    incBtn.className = 'py-2 text-xs font-mono uppercase font-bold tracking-wider text-center select-none active-btn text-black bg-brutal-green w-full';
    expBtn.className = 'py-2 text-xs font-mono uppercase font-bold tracking-wider text-center select-none text-muted w-full';
    incBtn.setAttribute('data-active', 'true');
    expBtn.setAttribute('data-active', 'false');
  } else {
    incBtn.className = 'py-2 text-xs font-mono uppercase font-bold tracking-wider text-center select-none text-muted w-full';
    expBtn.className = 'py-2 text-xs font-mono uppercase font-bold tracking-wider text-center select-none active-btn-red text-white bg-brutal-red w-full';
    incBtn.setAttribute('data-active', 'false');
    expBtn.setAttribute('data-active', 'true');
  }
};

// Inicialização Geral no DOMContentLoaded
document.addEventListener('DOMContentLoaded', initApp);
