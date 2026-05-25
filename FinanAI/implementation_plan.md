# Plano de Implementação: FinanAI (Dashboard Financeiro com IA Local)

O **FinanAI** será um painel financeiro pessoal completo, ultra-premium, com design moderno, dinâmico e focado em alta usabilidade. Toda a lógica de armazenamento e processamento do assistente de inteligência artificial financeira funcionará localmente no navegador (`localStorage` + heurísticas analíticas avançadas), garantindo privacidade absoluta e velocidade instantânea.

O projeto será desenvolvido com **React + TypeScript + Vite + Tailwind CSS + Recharts + Lucide React**, isolado completamente dentro do diretório [FinanAI](file:///c:/Users/KAIKYBOTELHODEFARIA/Documents/reconhecimento0imagem_Eng/FinanAI).

---

## 🎨 Compromisso de Design: Brutalist Dark HUD (Cyberpunk Lite)

Para romper com o clichê das interfaces fintech tradicionais (azul corporativo sem graça e cantos arredondados padrão) e evitar designs chatos gerados por IA, estabelecemos a seguinte identidade visual:

- **Escolha Topológica:** Layout assimétrico com menu vertical estrito na lateral esquerda, cabeçalhos de dados em tamanhos gigantescos com tipografia moderna, e cards geométricos com bordas nítidas de 1px.
- **Geometria:** Extremamente nítida (`rounded-none` a `rounded-sm` no máximo 2px) para dar um ar de terminal tecnológico de alta precisão.
- **Paleta de Cores (Purple Ban Cumprido ✅):**
  - Fundo: Preto profundo e Cinza escuro mineral (`#0A0A0C` e `#121214`).
  - Destaques/Acentos: Verde Neon/Ácido (`#22C55E` e `#4ADE80`) e Vermelho Coral/Alerta para despesas (`#EF4444`).
  - Textos: Branco puro (`#FFFFFF`) e Cinza fosco (`#9CA3AF`).
- **Efeitos e Movimento:** Micro-interações táteis nos botões com leves elevações em escala (`scale-102`), efeitos de brilho neon pulsante nas bordas ao focar e transições de entrada sincronizadas via CSS padrão.
- **Diferenciação:** Sem Bento Grid tradicional ou Mesh Gradients clichês. Um visual escuro de painel industrial/cyberpunk que faz o usuário se sentir no controle de um terminal de inteligência financeira de alta performance.

---

## 🛠️ Recursos Propostos

### 1. Painel Geral (Dashboard HUD)
- **Cards de Métricas Rápidas:** Saldo Total, Receita Mensal, Despesa Mensal e Taxa de Economia Geral com animações de contagem.
- **Gráfico de Fluxo de Caixa Principal:** Exibição interativa de receitas vs. despesas ao longo do tempo (gráficos de área/linhas suaves usando `Recharts`).
- **Widgets Inteligentes:** Distribuição de despesas por categoria (Gráfico de Rosca/Pizza) e lista de transações recentes com atalhos de edição rápida.
- **Acesso Rápido ao FinanAI:** Card de chamada dinâmico para o assistente de IA com resumo do "Insight do Dia".

### 2. FinanAI Chat (Assistente de Finanças na Máquina)
- Interface de chat dedicada para conversas sobre saúde financeira.
- Lógica analítica local em TypeScript: O assistente fará uma varredura real nas transações e metas salvas no `localStorage` para gerar respostas altamente personalizadas.
- **Exemplos de Interações Reais:**
  - *"Como posso economizar 20% este mês?"* → A IA analisa a receita atual e sugere cortes específicos nas categorias onde o usuário mais gastou (ex: alimentação ou transporte).
  - *"Simule uma compra de R$1.500 parcelada em 10x"* → A IA calcula o impacto do parcelamento no fluxo de caixa dos próximos meses e emite um veredito de risco ("Seguro", "Moderado" ou "Perigoso").
  - *"Minha saúde financeira está boa?"* → Retorna um score dinâmico (A+ a F) com base nas taxas de poupança recomendadas pela economia clássica.

### 3. Registro de Transações (Extrato Geométrico)
- Ledger completo de receitas e despesas com paginação e rolagem suave.
- Filtros avançados: Tipo (Entrada/Saída), Categorias Customizadas, Períodos de data e busca textual rápida.
- Formulário modal premium para adição/edição de transações com controle de datas, categorias (Alimentação, Moradia, Transporte, Lazer, Saúde, Outros) e campo de notas.

### 4. Metas de Economia (Savings Tracker)
- Gestão de metas financeiras específicas (ex: "Reserva de Emergência", "Comprar Carro", "Viagem dos Sonhos").
- Barra de progresso geométrica personalizada indicando o valor poupado vs. alvo.
- **Previsão por IA Local:** Cálculo do tempo estimado (em meses/dias) para atingir a meta com base na média real de economia do usuário nos últimos 3 meses.

### 5. Simulador Financeiro e Relatórios Analíticos
- Área dedicada para relatórios detalhados contendo filtros anuais e mensais.
- **Simulador de Impacto Financeiro:** Ferramenta interativa onde o usuário digita um valor de compra de desejo, e o simulador demonstra visualmente como aquela compra atrasaria ou adiantaria suas metas ativas.

---

## 🗂️ Estrutura de Arquivos Proposta

Todos os arquivos serão criados dentro de [FinanAI](file:///c:/Users/KAIKYBOTELHODEFARIA/Documents/reconhecimento0imagem_Eng/FinanAI):

```
FinanAI/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── TransactionHistory.tsx
│   │   ├── MetasTracker.tsx
│   │   ├── AIPlannerChat.tsx
│   │   ├── FinancialReports.tsx
│   │   └── ui/ (Cards, Modals, Inputs com design Brutalista)
│   ├── services/
│   │   ├── storage.ts (Abstração do localStorage)
│   │   └── aiEngine.ts (Motor de regras e heurísticas de IA local)
│   └── types.ts (Tipagens TypeScript para Transações, Metas, Mensagens)
```

---

## ⚙️ Plano de Verificação

### Testes Manuais e de UI
- Validação completa do fluxo de dados: Cadastrar transações, verificar alteração instantânea de gráficos de saldo e progresso de metas.
- Testar a IA local: Registrar gastos excessivos em uma categoria e fazer perguntas no chat para verificar se os insights se adaptam aos dados inseridos.
- Testar compatibilidade de tela (responsividade mobile-first) redimensionando a janela para layouts menores.
- Execução de scripts de auditoria visual (`ux_audit.py` e `lighthouse_audit.py`) para confirmar a conformidade estética e de performance.

---

> [!IMPORTANT]
> **Regra de Isolamento**: Nenhum arquivo fora do diretório `/FinanAI` será modificado. Toda a instalação de pacotes e inicialização do Vite será feita localmente no diretório adequado.

> [!TIP]
> O motor de IA local (`aiEngine.ts`) usará técnicas avançadas de análise de dados estáticos para simular uma inteligência conversacional nativa altamente responsiva e surpreendente!
