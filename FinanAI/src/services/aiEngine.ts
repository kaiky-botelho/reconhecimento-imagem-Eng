import { Transaction, SavingsGoal, UserProfile } from '../types';

export interface FinancialHealthReport {
  score: string;
  scoreColor: string;
  savingsRate: number;
  totalIncome: number;
  totalExpense: number;
  highestCategory: string;
  highestCategoryAmount: number;
  budgetStatus: 'under' | 'near' | 'over';
  budgetPercentage: number;
  recommendations: string[];
}

export const aiEngine = {
  // Gera relatório de saúde financeira com base nos dados do usuário
  analyzeFinancialHealth(
    transactions: Transaction[],
    goals: SavingsGoal[],
    profile: UserProfile
  ): FinancialHealthReport {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Agrupar gastos por categoria
    const categoryTotals: Record<string, number> = {};
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

    // Calcular taxa de economia (savings rate)
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Calcular score financeiro
    let score = 'C';
    let scoreColor = 'text-yellow-500';
    if (savingsRate >= 30) {
      score = 'A+';
      scoreColor = 'text-green-500';
    } else if (savingsRate >= 20) {
      score = 'A';
      scoreColor = 'text-emerald-400';
    } else if (savingsRate >= 10) {
      score = 'B';
      scoreColor = 'text-green-600';
    } else if (savingsRate >= 0) {
      score = 'C';
      scoreColor = 'text-yellow-400';
    } else {
      score = 'F';
      scoreColor = 'text-red-500';
    }

    // Status do Orçamento Limite Mensal
    const budgetPercentage = profile.monthlyBudgetLimit > 0
      ? (totalExpense / profile.monthlyBudgetLimit) * 100
      : 0;

    let budgetStatus: 'under' | 'near' | 'over' = 'under';
    if (budgetPercentage > 100) {
      budgetStatus = 'over';
    } else if (budgetPercentage >= 85) {
      budgetStatus = 'near';
    }

    // Gerar recomendações dinâmicas personalizadas
    const recommendations: string[] = [];

    if (savingsRate < 10) {
      recommendations.push(
        `Sua taxa de economia é de apenas ${savingsRate.toFixed(1)}%. Economistas recomendam poupar no mínimo 10% a 20% do seu ganho mensal.`
      );
    } else {
      recommendations.push(
        `Excelente! Você está poupando ${savingsRate.toFixed(1)}% do seu salário, acima da média saudável.`
      );
    }

    if (highestCategoryAmount > 0) {
      const highestPercentage = totalExpense > 0 ? (highestCategoryAmount / totalExpense) * 100 : 0;
      recommendations.push(
        `Seu maior foco de despesa é **${highestCategory}** (R$ ${highestCategoryAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}), representando ${highestPercentage.toFixed(1)}% dos seus gastos totais. Reduzir 15% aqui traria R$ ${(highestCategoryAmount * 0.15).toFixed(2)} extras por mês.`
      );
    }

    if (budgetStatus === 'over') {
      recommendations.push(
        `⚠️ ATENÇÃO: Seu orçamento mensal de R$ ${profile.monthlyBudgetLimit} foi estourado em ${budgetPercentage.toFixed(1)}%. Reduza gastos não essenciais imediatamente para evitar dívidas.`
      );
    } else if (budgetStatus === 'near') {
      recommendations.push(
        `Alerta: Você atingiu ${budgetPercentage.toFixed(1)}% do seu limite orçamentário mensal de R$ ${profile.monthlyBudgetLimit}. Restam apenas R$ ${(profile.monthlyBudgetLimit - totalExpense).toFixed(2)} para gastar.`
      );
    }

    if (goals.length > 0) {
      const activeGoal = goals[0];
      const neededAmount = activeGoal.targetAmount - activeGoal.currentAmount;
      if (neededAmount > 0 && netSavings > 0) {
        const monthsToGoal = neededAmount / netSavings;
        recommendations.push(
          `No ritmo atual de poupança (R$ ${netSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês), você completará sua meta **${activeGoal.title}** em aproximadamente ${Math.ceil(monthsToGoal)} meses.`
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

  // Motor conversacional da IA
  generateAIResponse(
    userInput: string,
    transactions: Transaction[],
    goals: SavingsGoal[],
    profile: UserProfile
  ): string {
    const input = userInput.toLowerCase();
    
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense;

    // 1. Simulação de Compras (Ex: "comprar celular de 2500" ou "comprar notebook por 1500")
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

          // Relação com as metas
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
      const analysis = this.analyzeFinancialHealth(transactions, goals, profile);
      
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
      const analysis = this.analyzeFinancialHealth(transactions, goals, profile);
      
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
