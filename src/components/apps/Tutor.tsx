import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, HelpCircle, GraduationCap, BookOpen, Brain, Activity, MessageSquare } from 'lucide-react';
import { askTutor } from '../../services/geminiService';
import { EcologicalStep, Scenario } from '../../types';

interface TutorProps {
  currentScenario: Scenario | null;
  currentStep: EcologicalStep;
  xp: number;
}

interface Message {
  sender: 'user' | 'tutor';
  text: string;
  timestamp: Date;
}

const STEP_GUIDES: Record<EcologicalStep, string[]> = {
  [EcologicalStep.SCENARIO_SELECTION]: [
    "Qual cenário devo escolher para começar?",
    "Qual a diferença entre os cenários epidemiológicos?",
    "Como o DATASUS ajuda na tomada de decisões em saúde pública?"
  ],
  [EcologicalStep.STUDY_DESIGN_CHOICE]: [
    "O que caracteriza um Estudo Ecológico?",
    "Por que não usar um ensaio clínico para estes dados?",
    "O que são dados agregados de base populacional?"
  ],
  [EcologicalStep.PICO_FORMULATION]: [
    "Como defino a População (P) em um estudo ecológico?",
    "O que colocar na Intervenção/Exposição (I) e Controle (C)?",
    "Como formular um Desfecho (O) mensurável?"
  ],
  [EcologicalStep.DATA_COLLECTION]: [
    "Como navegar no DATASUS / Tabnet?",
    "O que significam as siglas SIM, SINAN e SIH?",
    "Errei o sistema no DATASUS, o que acontece?"
  ],
  [EcologicalStep.ANALYSIS]: [
    "Como analisar o gráfico gerado no Pigxcel?",
    "O que significa um p-valor menor que 0.05?",
    "O que é o Intervalo de Confiança de 95% (IC95%)?"
  ],
  [EcologicalStep.WRITING]: [
    "Dicas para redigir a Introdução científica.",
    "O que deve constar na seção de Metodologia?",
    "Como a Portaria CNPq nº 2.664/2026 regulamenta o uso de IA?"
  ],
  [EcologicalStep.SUBMISSION]: [
    "Como exportar meu manuscrito final?",
    "Quais são os erros mais comuns na escrita científica?",
    "O que é a temida Falácia Ecológica?"
  ],
  [EcologicalStep.AWAITING_REVIEW]: [
    "Como funciona a revisão por pares (Peer Review)?",
    "O que os revisores avaliam no manuscrito?",
    "Qual a importância de declarar o uso de IA?"
  ],
  [EcologicalStep.BANNER_CREATION]: [
    "Como estruturar um pôster científico de congresso?",
    "Qual a diferença entre o banner e o manuscrito?",
    "O que colocar no campo de conclusões do pôster?"
  ],
  [EcologicalStep.JOURNAL_SUBMISSION]: [
    "Como escolher a revista certa para submissão?",
    "O que são periódicos predatórios e por que evitá-los?",
    "Qual a diferença entre Qualis A1, A2 e revistas sem indexação?"
  ],
  [EcologicalStep.COMPLETED]: [
    "Parabéns pelo encerramento! O que é o Currículo Lattes?",
    "Como registrar minhas publicações no Lattes?",
    "Qual o próximo passo na minha carreira acadêmica?"
  ]
};

type BotType = 'pig_gpt' | 'pig_laude' | 'pig_mini';

export const Tutor: React.FC<TutorProps> = ({ currentScenario, currentStep, xp }) => {
  const [activeChatbot, setActiveChatbot] = useState<BotType>('pig_gpt');
  
  // Keep separate chat histories for each chatbot
  const [chatbotHistories, setChatbotHistories] = useState<Record<BotType, Message[]>>({
    pig_gpt: [
      {
        sender: 'tutor',
        text: "Olá! Sou o **PigGPT**, seu Assistente Geral de Pesquisa. Estou aqui para guiar seus estudos epidemiológicos e tirar dúvidas sobre metodologia, bioestatística e redação científica de forma clara e amigável.\n\nComo posso ajudar você no passo atual?",
        timestamp: new Date()
      }
    ],
    pig_laude: [
      {
        sender: 'tutor',
        text: "Saudações acadêmicas! Sou o **Piglaude**, especialista sênior em Metodologia Científica e Desenho Metodológico. Posso te ajudar a estruturar suas ideias, evitar vieses sistemáticos (informação, seleção) ou fatores de confusão, e refinar a redação do seu manuscrito.\n\nQual aspecto científico quer aprofundar?",
        timestamp: new Date()
      }
    ],
    pig_mini: [
      {
        sender: 'tutor',
        text: "E aí! Sou o **Pigmini**, seu tutor rápido e focado em Bioestatística prática e análise de dados do DATASUS. Se tiver dúvidas sobre p-valores, intervalos de confiança de 95% ou preenchimento de planilhas de dados, fale comigo que vou direto ao ponto!\n\nEm que posso te ajudar agora?",
        timestamp: new Date()
      }
    ]
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messages = chatbotHistories[activeChatbot];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const formatMarkdown = (text: string) => {
    if (!text) return "";
    
    let formatted = text;
    const paragraphs = formatted.split('\n');
    return paragraphs.map((p, pIdx) => {
      // Remove leading dash or asterisk for list items visually, 
      // but keep track of it so we can render an <li>
      let isListItem = false;
      let rawText = p.trim();
      
      if (rawText.startsWith('-') || rawText.startsWith('* ')) {
        isListItem = true;
        rawText = rawText.substring(rawText.startsWith('* ') ? 2 : 1).trim();
      }

      const parts = rawText.split(/\*\*([^*]+)\*\*/g);
      
      const content = parts.map((part, partIdx) => {
        if (partIdx % 2 === 1) {
          return (
            <strong key={partIdx} className="font-bold text-slate-900 bg-slate-100/80 px-1 rounded mx-0.5 border border-slate-200/50">
              {part}
            </strong>
          );
        }
        return part;
      });

      if (isListItem) {
        return (
          <li key={pIdx} className="ml-4 list-disc text-slate-700 leading-relaxed my-1 text-sm">
            {content}
          </li>
        );
      }
      
      return rawText === "" ? (
        <div key={pIdx} className="h-2"></div>
      ) : (
        <p key={pIdx} className="text-slate-700 leading-relaxed text-sm my-1.5">
          {content}
        </p>
      );
    });
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    // Update active chatbot history
    setChatbotHistories(prev => ({
      ...prev,
      [activeChatbot]: [...prev[activeChatbot], userMsg]
    }));
    
    setInputValue('');
    setIsLoading(true);

    try {
      const stepName = EcologicalStep[currentStep];
      const context = `O aluno está no passo ${stepName} da simulação de Estudo Ecológico. Cenário atual: ${currentScenario ? currentScenario.title : "Nenhum"}. Pontuação atual de XP: ${xp}.`;
      
      // Call askTutor passing active chatbot
      const response = await askTutor(currentStep, text, context, activeChatbot);
      
      setChatbotHistories(prev => ({
        ...prev,
        [activeChatbot]: [...prev[activeChatbot], {
          sender: 'tutor',
          text: response,
          timestamp: new Date()
        }]
      }));
    } catch (error) {
      setChatbotHistories(prev => ({
        ...prev,
        [activeChatbot]: [...prev[activeChatbot], {
          sender: 'tutor',
          text: "Desculpe, ocorreu uma oscilação na conexão com o cérebro do assistente. Lembre-se: em estudos ecológicos comparamos grupos agregados (como taxas municipais), evitando a Falácia Ecológica.",
          timestamp: new Date()
        }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Bot Specific Colors & Configs for the Active Header
  const botConfig = {
    pig_gpt: {
      title: 'PigGPT',
      tag: 'Geral & Redação',
      gradient: 'from-emerald-600 to-teal-700',
      tagBg: 'bg-emerald-500',
      icon: <Sparkles className="text-white" size={18} />
    },
    pig_laude: {
      title: 'Piglaude',
      tag: 'Metodologia & Desenho',
      gradient: 'from-amber-600 to-orange-700',
      tagBg: 'bg-amber-500',
      icon: <BookOpen className="text-white" size={18} />
    },
    pig_mini: {
      title: 'Pigmini',
      tag: 'Bioestatística Ágil',
      gradient: 'from-purple-600 to-indigo-700',
      tagBg: 'bg-purple-500',
      icon: <Activity className="text-white" size={18} />
    }
  }[activeChatbot];

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-lg" id="tutor_chatbot_container">
      {/* Header */}
      <div className={`bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800 transition-all`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${botConfig.gradient} flex items-center justify-center shadow-md`}>
            {botConfig.icon}
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
              {botConfig.title} 
              <span className={`text-[9px] ${botConfig.tagBg} text-white px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider`}>
                {botConfig.tag}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Tutor de Estudos Epidemiológicos</p>
          </div>
        </div>
        <div className="bg-slate-800 text-[9px] font-bold px-2 py-0.5 rounded text-slate-300 border border-slate-700">
          Etapa {currentStep + 1}/11
        </div>
      </div>

      {/* Bot Tabs Selector (Dynamic Switcher) */}
      <div className="bg-slate-950 p-1 flex gap-1 border-b border-slate-800 shrink-0">
        {[
          { id: 'pig_gpt', label: 'PigGPT', desc: 'Geral', color: 'border-emerald-500/50 text-emerald-400', activeBg: 'bg-emerald-950 text-emerald-300 border-emerald-500' },
          { id: 'pig_laude', label: 'Piglaude', desc: 'Metodologia', color: 'border-amber-500/50 text-amber-400', activeBg: 'bg-amber-950 text-amber-300 border-amber-500' },
          { id: 'pig_mini', label: 'Pigmini', desc: 'Bioestatística', color: 'border-purple-500/50 text-purple-400', activeBg: 'bg-purple-950 text-purple-300 border-purple-500' }
        ].map(bot => {
          const isActive = activeChatbot === bot.id;
          return (
            <button
              key={bot.id}
              onClick={() => setActiveChatbot(bot.id as BotType)}
              className={`flex-1 py-1 px-1 rounded text-[11px] font-bold tracking-wide transition-all border cursor-pointer ${
                isActive 
                  ? `${bot.activeBg} shadow-sm scale-[1.02]` 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              {bot.label}
              <span className="block text-[8px] font-normal opacity-60">{bot.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100%-140px)]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none font-sans' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none font-sans'
            }`}>
              {msg.sender === 'tutor' && (
                <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1 uppercase tracking-wide">
                  <Brain size={10} className="text-slate-500" /> {botConfig.title}
                </div>
              )}
              {msg.sender === 'user' ? (
                <p className="text-sm leading-relaxed">{msg.text}</p>
              ) : (
                <div className="space-y-1">
                  {formatMarkdown(msg.text)}
                </div>
              )}
              <span className={`text-[9px] mt-1 block text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 mr-1.5 animate-pulse">Pensando...</span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Questions */}
      <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-2 whitespace-nowrap scrollbar-none shrink-0">
        {STEP_GUIDES[currentStep]?.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-600 text-[11px] font-medium px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
          >
            <HelpCircle size={12} className="text-blue-500" />
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-slate-200 flex gap-2 shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend(inputValue)}
          placeholder={`Pergunte ao ${botConfig.title}...`}
          className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
        />
        <button
          onClick={() => handleSend(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
