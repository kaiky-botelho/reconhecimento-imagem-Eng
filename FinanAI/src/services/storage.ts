import { Transaction, SavingsGoal, UserProfile, ChatMessage } from '../types';

const KEYS = {
  TRANSACTIONS: 'finanai_transactions',
  GOALS: 'finanai_goals',
  PROFILE: 'finanai_profile',
  CHAT: 'finanai_chat'
};

const INITIAL_PROFILE: UserProfile = {
  name: 'Usuário Pro',
  monthlyBudgetLimit: 4500
};

const INITIAL_GOALS: SavingsGoal[] = [
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

const getPastDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't-1',
    description: 'Salário Principal',
    amount: 8500,
    type: 'income',
    category: 'Salário',
    date: getPastDate(20),
    notes: 'Salário CLT líquido'
  },
  {
    id: 't-2',
    description: 'Projeto de Design Freelance',
    amount: 1500,
    type: 'income',
    category: 'Freelance',
    date: getPastDate(12),
    notes: 'Criação de identidade visual'
  },
  {
    id: 't-3',
    description: 'Aluguel do Apartamento',
    amount: 2200,
    type: 'expense',
    category: 'Moradia',
    date: getPastDate(18),
    notes: 'Inclui condomínio'
  },
  {
    id: 't-4',
    description: 'Supermercado Mensal',
    amount: 984.5,
    type: 'expense',
    category: 'Alimentação',
    date: getPastDate(15),
    notes: 'Compra de suprimentos para o mês'
  },
  {
    id: 't-5',
    description: 'Combustível Posto Ipiranga',
    amount: 320,
    type: 'expense',
    category: 'Transporte',
    date: getPastDate(14),
    notes: 'Tanque cheio'
  },
  {
    id: 't-6',
    description: 'Assinaturas Digitais (Netflix/Spotify)',
    amount: 149.9,
    type: 'expense',
    category: 'Lazer',
    date: getPastDate(10),
    notes: 'Débito automático'
  },
  {
    id: 't-7',
    description: 'Consulta Médica de Rotina',
    amount: 350,
    type: 'expense',
    category: 'Saúde',
    date: getPastDate(7),
    notes: 'Reembolso solicitado'
  },
  {
    id: 't-8',
    description: 'Restaurante Japonês',
    amount: 280,
    type: 'expense',
    category: 'Lazer',
    date: getPastDate(4),
    notes: 'Jantar com amigos'
  },
  {
    id: 't-9',
    description: 'Investimento em Cripto',
    amount: 500,
    type: 'expense',
    category: 'Outros',
    date: getPastDate(2),
    notes: 'Aporte mensal'
  }
];

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'c-1',
    sender: 'ai',
    text: 'Olá! Sou o assistente FinanAI. Estou aqui para analisar suas finanças em tempo real, dar insights de economia e simular impactos de gastos. Como posso te ajudar hoje?',
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
];

export const storage = {
  // Transações
  getTransactions(): Transaction[] {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(data);
  },

  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  // Metas
  getGoals(): SavingsGoal[] {
    const data = localStorage.getItem(KEYS.GOALS);
    if (!data) {
      localStorage.setItem(KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
      return INITIAL_GOALS;
    }
    return JSON.parse(data);
  },

  saveGoals(goals: SavingsGoal[]): void {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },

  // Perfil
  getProfile(): UserProfile {
    const data = localStorage.getItem(KEYS.PROFILE);
    if (!data) {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    return JSON.parse(data);
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  // Histórico do Chat
  getChatHistory(): ChatMessage[] {
    const data = localStorage.getItem(KEYS.CHAT);
    if (!data) {
      localStorage.setItem(KEYS.CHAT, JSON.stringify(INITIAL_CHAT));
      return INITIAL_CHAT;
    }
    return JSON.parse(data);
  },

  saveChatHistory(history: ChatMessage[]): void {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(history));
  },

  clearChatHistory(): void {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(INITIAL_CHAT));
  }
};
