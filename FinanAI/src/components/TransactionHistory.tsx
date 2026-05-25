import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Filter,
  X,
  FileText,
  DollarSign
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (id: string, transaction: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (isOpen: boolean) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  isAddModalOpen,
  setIsAddModalOpen
}) => {
  // Estados de filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedType, setSelectedType] = useState<'All' | 'income' | 'expense'>('All');

  // Estados do Modal
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Estados dos inputs do formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('Alimentação');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const categories = [
    'Alimentação',
    'Moradia',
    'Transporte',
    'Lazer',
    'Saúde',
    'Salário',
    'Freelance',
    'Outros'
  ];

  // Abrir modal de criação
  const openCreateModal = () => {
    setDescription('');
    setAmount('');
    setType('expense');
    setCategory('Alimentação');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  // Abrir modal de edição
  const openEditModal = (t: Transaction) => {
    setEditingTransaction(t);
    setDescription(t.description);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategory(t.category);
    setDate(t.date);
    setNotes(t.notes || '');
    setIsAddModalOpen(true);
  };

  // Submissão do formulário (Criar ou Editar)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    const data = {
      description,
      amount: numericAmount,
      type,
      category,
      date,
      notes: notes || undefined
    };

    if (editingTransaction) {
      onEditTransaction(editingTransaction.id, data);
    } else {
      onAddTransaction(data);
    }
    
    setIsAddModalOpen(false);
  };

  // Lógica de filtragem
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todas' || t.category === selectedCategory;
    const matchesType = selectedType === 'All' || t.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brutal-border pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-mono tracking-tight uppercase">
            EXTRATO DE <span className="text-brutal-green">TRANSAÇÕES</span>
          </h1>
          <p className="text-xs text-brutal-textMuted font-mono mt-1">
            Total registrado: <span className="text-white font-semibold font-mono">{transactions.length}</span> | Filtrados: <span className="text-brutal-green font-semibold font-mono">{filteredTransactions.length}</span>
          </p>
        </div>
        
        <button 
          onClick={openCreateModal}
          className="brutal-btn-primary"
        >
          <Plus size={16} /> Nova Transação
        </button>
      </div>

      {/* Barra de Filtros Brutalista */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-brutal-panel border border-brutal-border">
        {/* Pesquisa */}
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="brutal-input pl-9"
          />
          <Search size={14} className="absolute left-3 top-3 text-brutal-textMuted" />
        </div>

        {/* Tipo */}
        <div className="flex border border-brutal-border bg-brutal-panelLight p-0.5">
          <button
            onClick={() => setSelectedType('All')}
            className={`flex-1 text-[10px] uppercase font-mono py-1.5 transition-all text-center cursor-pointer ${
              selectedType === 'All' ? 'bg-brutal-green text-black font-bold' : 'text-brutal-textMuted hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedType('income')}
            className={`flex-1 text-[10px] uppercase font-mono py-1.5 transition-all text-center cursor-pointer ${
              selectedType === 'income' ? 'bg-brutal-green text-black font-bold' : 'text-brutal-textMuted hover:text-white'
            }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setSelectedType('expense')}
            className={`flex-1 text-[10px] uppercase font-mono py-1.5 transition-all text-center cursor-pointer ${
              selectedType === 'expense' ? 'bg-brutal-green text-black font-bold' : 'text-brutal-textMuted hover:text-white'
            }`}
          >
            Saídas
          </button>
        </div>

        {/* Categoria */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="brutal-input"
            style={{ appearance: 'none' }}
          >
            <option value="Todas">Todas as Categorias</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Limpar Filtros */}
        <button
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('Todas');
            setSelectedType('All');
          }}
          className="brutal-btn-secondary w-full"
        >
          <Filter size={14} /> Limpar Filtros
        </button>
      </div>

      {/* Tabela de Transações */}
      <div className="border border-brutal-border bg-brutal-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="bg-brutal-panelLight border-b border-brutal-border text-[10px] uppercase tracking-wider text-brutal-textMuted">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brutal-border text-xs">
              {filteredTransactions.map((t) => (
                <tr 
                  key={t.id}
                  className="hover:bg-brutal-panelLight/40 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-brutal-textMuted">
                    {new Date(t.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-white block">{t.description}</span>
                    {t.notes && <span className="text-[10px] text-brutal-textMuted block mt-0.5">{t.notes}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="brutal-badge"
                      style={{ 
                        color: t.type === 'income' ? '#4ADE80' : '#EF4444', 
                        borderColor: t.type === 'income' ? 'rgba(74,222,128,0.2)' : 'rgba(239,68,68,0.2)' 
                      }}
                    >
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold whitespace-nowrap font-mono ${t.type === 'income' ? 'text-brutal-green' : 'text-brutal-red'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEditModal(t)}
                        className="text-neutral-400 hover:text-brutal-green transition-colors p-1 cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir a transação "${t.description}"?`)) {
                            onDeleteTransaction(t.id);
                          }
                        }}
                        className="text-neutral-400 hover:text-brutal-red transition-colors p-1 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-brutal-textMuted font-mono text-xs">
                    Nenhuma transação encontrada correspondente aos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Nova/Edição de Transação */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-brutal-panel border border-brutal-border p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-brutal-border pb-4 mb-4">
              <h3 className="font-mono text-base font-bold uppercase tracking-wider flex items-center gap-2">
                <FileText size={18} className="text-brutal-green" /> 
                {editingTransaction ? 'Editar Lançamento' : 'Cadastrar Movimentação'}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-brutal-textMuted hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Seletor de Tipo (Receita vs Despesa) */}
              <div className="grid grid-cols-2 gap-2 border border-brutal-border p-0.5 bg-brutal-panelLight">
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-2 text-xs font-mono uppercase font-bold tracking-wider transition-all text-center cursor-pointer ${
                    type === 'income' ? 'bg-brutal-green text-black' : 'text-brutal-textMuted hover:text-white'
                  }`}
                >
                  Receita (Entrada)
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-xs font-mono uppercase font-bold tracking-wider transition-all text-center cursor-pointer ${
                    type === 'expense' ? 'bg-brutal-red text-white' : 'text-brutal-textMuted hover:text-white'
                  }`}
                >
                  Despesa (Saída)
                </button>
              </div>

              {/* Descrição & Valor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-mono text-brutal-textMuted uppercase mb-1">Descrição</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Salário CLT, Compras, Netflix..."
                    className="brutal-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-brutal-textMuted uppercase mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="brutal-input"
                    required
                  />
                </div>
              </div>

              {/* Categoria & Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono text-brutal-textMuted uppercase mb-1">Categoria</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="brutal-input"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-brutal-textMuted uppercase mb-1">Data</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="brutal-input"
                    required
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-[10px] font-mono text-brutal-textMuted uppercase mb-1">Notas / Detalhes (Opcional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais..."
                  rows={2}
                  className="brutal-input resize-none"
                />
              </div>

              {/* Ações */}
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
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
