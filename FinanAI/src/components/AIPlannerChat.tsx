import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, Bot, User } from 'lucide-react';
import { ChatMessage, Transaction, SavingsGoal, UserProfile } from '../types';
import { aiEngine } from '../services/aiEngine';

interface AIPlannerChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: ChatMessage) => void;
  onClearHistory: () => void;
  transactions: Transaction[];
  goals: SavingsGoal[];
  profile: UserProfile;
}

export const AIPlannerChat: React.FC<AIPlannerChatProps> = ({
  chatHistory,
  onSendMessage,
  onClearHistory,
  transactions,
  goals,
  profile
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { label: '📊 Minha saúde financeira', text: 'Minha saúde financeira está boa?' },
    { label: '💡 Dicas para economizar', text: 'Como posso economizar?' },
    { label: '🛍️ Simular Compra (R$ 2.500)', text: 'Simular compra de R$ 2500' },
    { label: '💸 Maior ralo de dinheiro', text: 'Analisar maior categoria de gastos' }
  ];

  // Rolar para o final quando houver nova mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // 1. Enviar mensagem do usuário
    const userMsg: ChatMessage = {
      id: `c-u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    onSendMessage(userMsg);
    setInputValue('');

    // 2. Simular digitação da IA
    setIsTyping(true);
    setTimeout(() => {
      // Obter resposta do motor analítico
      const aiResponseText = aiEngine.generateAIResponse(textToSend, transactions, goals, profile);
      
      const aiMsg: ChatMessage = {
        id: `c-a-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      onSendMessage(aiMsg);
      setIsTyping(false);
    }, 750); // Simulação de processamento de dados local
  };

  // Tratar formatação de parágrafos/negrito simples da IA
  const renderMessageText = (text: string) => {
    return text.split('\n').map((paragraph, index) => {
      // Substituir **texto** por tag strong
      let formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-mono">$1</strong>');
      // Substituir ### Titulo por headings
      if (formatted.startsWith('### ')) {
        return (
          <h4 key={index} className="text-sm font-bold font-mono text-brutal-green uppercase tracking-wider mt-4 mb-2">
            {formatted.replace('### ', '')}
          </h4>
        );
      }
      // Verificar se é item de lista
      if (formatted.startsWith('- ') || formatted.startsWith('* ')) {
        return (
          <li key={index} className="list-none pl-4 text-neutral-300 font-mono text-xs mb-1.5 relative">
            <span className="absolute left-0 text-brutal-green">▪</span>
            <span dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
          </li>
        );
      }
      return (
        <p 
          key={index} 
          dangerouslySetInnerHTML={{ __html: formatted }} 
          className="text-xs text-neutral-300 font-mono leading-relaxed mb-2"
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-60px)]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-brutal-border pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight uppercase flex items-center gap-2">
            ASSISTENTE <span className="text-brutal-green">FINANAI</span>
          </h1>
          <p className="text-[10px] text-brutal-textMuted font-mono uppercase mt-1">
            Módulo Conversacional On-Device | Análise de dados estatísticos integrada
          </p>
        </div>

        <button 
          onClick={() => {
            if (confirm('Deseja limpar todo o histórico de mensagens?')) {
              onClearHistory();
            }
          }}
          className="border border-brutal-border hover:border-brutal-red text-brutal-textMuted hover:text-brutal-red p-2 text-xs font-mono transition-all duration-200 cursor-pointer"
          title="Limpar Conversa"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Caixa de Conversa (Scrollable) */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
        {chatHistory.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isAI ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-left'}`}
            >
              {/* Avatar brutalista */}
              <div className={`h-8 w-8 shrink-0 border flex items-center justify-center ${
                isAI 
                  ? 'bg-brutal-panel border-brutal-green text-brutal-green shadow-neon-green' 
                  : 'bg-brutal-panelLight border-neutral-600 text-white'
              }`}>
                {isAI ? <Bot size={15} /> : <User size={15} />}
              </div>

              {/* Balão de mensagem */}
              <div className={`p-4 border ${
                isAI 
                  ? 'bg-brutal-panel border-brutal-border rounded-none' 
                  : 'bg-brutal-panelLight border-neutral-700 rounded-none'
              }`}>
                {isAI ? (
                  <div>{renderMessageText(msg.text)}</div>
                ) : (
                  <p className="text-xs font-mono text-white leading-relaxed">{msg.text}</p>
                )}
                <span className="text-[9px] font-mono text-brutal-textMuted block text-right mt-2 uppercase tracking-tighter">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Indicador de Digitação da IA */}
        {isTyping && (
          <div className="flex gap-3 mr-auto items-center">
            <div className="h-8 w-8 border border-brutal-green bg-brutal-panel text-brutal-green flex items-center justify-center animate-pulse">
              <Bot size={15} />
            </div>
            <div className="p-3 border border-brutal-border bg-brutal-panel font-mono text-[10px] text-brutal-green animate-pulse">
              <span>● FinanAI está lendo seu banco de dados e processando insights...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Atalhos Rápidos e Campo de Envio */}
      <div className="pt-4 border-t border-brutal-border bg-brutal-bg shrink-0 space-y-4">
        {/* Prompts Rápidos */}
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSend(p.text)}
              disabled={isTyping}
              className="text-[10px] font-mono border border-brutal-border bg-brutal-panelLight px-2.5 py-1.5 text-neutral-300 hover:border-brutal-green hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }} 
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pergunte sobre seus gastos, limite mensal, ou simule uma compra..."
            className="brutal-input flex-1 py-3"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={isTyping || !inputValue.trim()}
            className="brutal-btn-primary px-5 disabled:opacity-50"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
