import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TransactionHistory } from './components/TransactionHistory';
import { MetasTracker } from './components/MetasTracker';
import { AIPlannerChat } from './components/AIPlannerChat';
import { FinancialReports } from './components/FinancialReports';
import { storage } from './services/storage';
import { Transaction, SavingsGoal, UserProfile, ChatMessage } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ name: '', monthlyBudgetLimit: 0 });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);

  // Carregar dados iniciais do storage no mount
  useEffect(() => {
    setTransactions(storage.getTransactions());
    setGoals(storage.getGoals());
    setProfile(storage.getProfile());
    setChatHistory(storage.getChatHistory());
  }, []);

  // Handlers de Transações
  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `t-${Date.now()}`
    };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    storage.saveTransactions(updated);
  };

  const handleEditTransaction = (id: string, updatedData: Partial<Transaction>) => {
    const updated = transactions.map((t) => 
      t.id === id ? { ...t, ...updatedData } : t
    );
    setTransactions(updated);
    storage.saveTransactions(updated);
  };

  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    storage.saveTransactions(updated);
  };

  // Handlers de Metas
  const handleAddGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `goal-${Date.now()}`
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    storage.saveGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    storage.saveGoals(updated);
  };

  const handleUpdateGoalAmount = (id: string, amountToAdd: number) => {
    // 1. Atualizar o valor acumulado na meta
    let goalTitle = '';
    const updatedGoals = goals.map((g) => {
      if (g.id === id) {
        goalTitle = g.title;
        return { ...g, currentAmount: g.currentAmount + amountToAdd };
      }
      return g;
    });
    setGoals(updatedGoals);
    storage.saveGoals(updatedGoals);

    // 2. Criar uma transação automática de saída (Aporte de Economia) para registrar o fluxo de caixa
    const automaticTransaction: Transaction = {
      id: `t-auto-${Date.now()}`,
      description: `Aporte Meta: ${goalTitle || 'Economia'}`,
      amount: amountToAdd,
      type: 'expense',
      category: 'Outros',
      date: new Date().toISOString().split('T')[0],
      notes: `Aporte transferido localmente para a meta de economia.`
    };
    const updatedTransactions = [automaticTransaction, ...transactions];
    setTransactions(updatedTransactions);
    storage.saveTransactions(updatedTransactions);
  };

  // Handlers de Perfil e Chat
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    storage.saveProfile(newProfile);
  };

  const handleSendMessage = (message: ChatMessage) => {
    const updated = [...chatHistory, message];
    setChatHistory(updated);
    storage.saveChatHistory(updated);
  };

  const handleClearChatHistory = () => {
    storage.clearChatHistory();
    setChatHistory(storage.getChatHistory());
  };

  // Switch de Renderização de abas
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions} 
            goals={goals} 
            profile={profile} 
            setCurrentTab={setCurrentTab}
            onOpenAddTransaction={() => setIsAddTransactionModalOpen(true)}
          />
        );
      case 'transactions':
        return (
          <TransactionHistory 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            isAddModalOpen={isAddTransactionModalOpen}
            setIsAddModalOpen={setIsAddTransactionModalOpen}
          />
        );
      case 'goals':
        return (
          <MetasTracker 
            goals={goals}
            transactions={transactions}
            onAddGoal={handleAddGoal}
            onDeleteGoal={handleDeleteGoal}
            onUpdateGoalAmount={handleUpdateGoalAmount}
          />
        );
      case 'chat':
        return (
          <AIPlannerChat 
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearChatHistory}
            transactions={transactions}
            goals={goals}
            profile={profile}
          />
        );
      case 'reports':
        return (
          <FinancialReports 
            transactions={transactions}
            goals={goals}
            profile={profile}
          />
        );
      default:
        return (
          <div className="font-mono text-xs text-brutal-textMuted py-20 text-center">
            Aba desconhecida ou em desenvolvimento.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-brutal-bg">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Main Panel Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
