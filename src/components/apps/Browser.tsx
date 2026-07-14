
import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowLeft, ArrowRight, RefreshCw, Download, Lock, Mail, Send, Paperclip, FileText, X, Globe, ShieldCheck, Inbox, BookOpen, Loader2, Info, Quote, ExternalLink, HelpCircle, CheckCircle, AlertCircle, Bookmark, BookmarkCheck, Book, GraduationCap, DollarSign, ThumbsUp, ThumbsDown, Trash2, AlertTriangle, Award, XCircle, Youtube, Gamepad2 } from 'lucide-react';
import { generateTabnetData, searchPubMed } from '../../services/geminiService';
import { TabnetData, ArticleHit, VirtualFile, Scenario, Email, GameStats, EcologicalStep } from '../../types';

interface BrowserProps {
  onSaveFile: (file: VirtualFile) => void;
  currentScenario: Scenario | null;
  onEmailSend: (attachmentId: string | null) => void;
  fileSystem: VirtualFile[];
  emails: Email[];
  onSaveReference: (article: ArticleHit) => void;
  savedReferences: ArticleHit[];
  onLogAction: (key: keyof GameStats, value?: any) => void;
  onQuizComplete: (xp: number) => void;
  currentStep: EcologicalStep;
  onJournalSubmit: () => void;
  onCongressSuccess?: () => void;
  onLattesSuccess?: () => void;
  inputUser?: string;
}

// Updated Educational Emails with Quizzes
const EDUCATIONAL_EMAILS: Email[] = [
    {
        id: 'quiz1',
        from: 'Prof. Bioestatística',
        subject: 'Quiz: Denominadores em Saúde',
        body: 'Caro aluno, para sua análise estar correta, você precisa dominar os indicadores. Responda para ganhar nota de participação:',
        read: false,
        date: new Date(Date.now() - 3600000),
        quiz: {
            question: "Para calcular o Coeficiente de Mortalidade Infantil, dividimos os óbitos (<1 ano) por:",
            options: [
                "População Total do município",
                "Nascidos Vivos no mesmo período (SINASC)",
                "Mulheres em idade fértil (10-49 anos)",
                "Total de óbitos gerais (SIM)"
            ],
            correctIdx: 1,
            explanation: "Correto! Usamos Nascidos Vivos para estimar o risco de uma criança nascida viva morrer no primeiro ano."
        }
    },
    {
        id: 'quizStats',
        from: 'Monitoria PIG IV',
        subject: 'Quiz: Intervalo de Confiança',
        body: 'Você encontrou um Risco Relativo (RR) de 1.5. Mas isso é estatisticamente significante? Depende do IC.',
        read: false,
        date: new Date(Date.now() - 7200000),
        quiz: {
            question: "Se o Intervalo de Confiança 95% do RR for [0.8 - 2.2], o resultado é significante?",
            options: [
                "Sim, pois o RR é maior que 1.",
                "Não, pois o intervalo inclui o valor 1 (nulidade).",
                "Sim, pois o intervalo é estreito.",
            ],
            correctIdx: 1,
            explanation: "Exato! Se o IC95% cruza o valor 1.0 (em RR ou OR), não podemos afirmar que há associação estatística (p > 0.05)."
        }
    },
    {
        id: 'edu_cep',
        from: 'Comitê de Ética (CEP)',
        subject: 'Memorando: Dispensa de TCLE',
        body: 'Prezados pesquisadores,\n\nEsclarecemos que conforme a Resolução CNS nº 510/2016, pesquisas que utilizam APENAS dados de domínio público que não identifiquem os participantes (como os dados agregados do DATASUS/TabNet que vocês estão usando) não precisam de registro nem avaliação pelo sistema CEP/CONEP.\n\nAtenciosamente,\nCoordenação do CEP.',
        read: false,
        date: new Date(Date.now() - 10000000)
    },
    {
        id: 'edu_vies',
        from: 'Prof. Metodologia',
        subject: 'Atenção aos Vieses de Informação',
        body: 'Ao discutir seus resultados, lembrem-se que trabalhamos com dados secundários. O principal problema aqui é a SUBNOTIFICAÇÃO.\n\nNem todos os casos reais chegam ao sistema (SINAN). Isso gera um Viés de Informação (Aferição). Se uma região tem "menos casos", pode ser apenas que ela notifique pior que a outra, e não que tenha menos doença de fato. Citem isso nas limitações!',
        read: false,
        date: new Date(Date.now() - 12000000)
    },
    {
        id: 'edu_predatoria',
        from: 'Biblioteca Central',
        subject: 'ALERTA URGENTE: Revistas Predatórias',
        body: 'Identificamos alunos submetendo artigos em revistas fraudulentas (Predatórias). \n\nSinais de perigo:\n1. Cobrança de taxas abusivas (APCs) antes do aceite.\n2. Promessa de publicação "Fast Track" em 24h/48h.\n3. Falta de revisão por pares real.\n4. Títulos genéricos (Ex: "Global Journal of Science").\n\nPublicar nessas revistas "queima" seu currículo Lattes. Verifiquem sempre o Qualis Capes ou o DOAJ.',
        read: false,
        date: new Date(Date.now() - 15000000)
    }
];

export const Browser: React.FC<BrowserProps> = ({ onSaveFile, currentScenario, onEmailSend, fileSystem, emails, onSaveReference, savedReferences, onLogAction, onQuizComplete, currentStep, onJournalSubmit, onCongressSuccess, onLattesSuccess, inputUser }) => {
  const [history, setHistory] = useState<string[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [inputUrl, setInputUrl] = useState<string>('https://piggle.com');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Tabnet
  const [tabnetStep, setTabnetStep] = useState<'system_select' | 'config' | 'result'>('system_select');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [disease, setDisease] = useState(currentScenario ? currentScenario.recommendedKeywords[0] : 'Dengue');
  const [region, setRegion] = useState('Estado de São Paulo');
  const [rowVar, setRowVar] = useState('Município');
  const [colVar, setColVar] = useState('Ano');
  const [generatedData, setGeneratedData] = useState<TabnetData | null>(null);

  // PubMed
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<ArticleHit[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<ArticleHit | null>(null);
  const [showAbntModal, setShowAbntModal] = useState(false);
  const [showSearchTips, setShowSearchTips] = useState(false);
  const [showSearchError, setShowSearchError] = useState(false);
  const [verifiedArticles, setVerifiedArticles] = useState<string[]>([]);
  const [abntSelectedIdx, setAbntSelectedIdx] = useState<number | null>(null); 
  const [abntResult, setAbntResult] = useState<'correct' | 'incorrect' | null>(null);

  // PubMed Advanced Search Builder
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advTerm1, setAdvTerm1] = useState('');
  const [advField1, setAdvField1] = useState('All Fields');
  const [advOp, setAdvOp] = useState('AND');
  const [advTerm2, setAdvTerm2] = useState('');
  const [advField2, setAdvField2] = useState('All Fields');

  // Mail
  const [mailView, setMailView] = useState<'inbox' | 'compose' | 'read'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [attachment, setAttachment] = useState<VirtualFile | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  
  // Custom tabs states
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [pigamesCategory, setPigamesCategory] = useState<string | null>(null);
  const [pigamesAnswered, setPigamesAnswered] = useState(false);
  const [pigamesSelectedOption, setPigamesSelectedOption] = useState<number | null>(null);
  const [pigamesFeedback, setPigamesFeedback] = useState<string | null>(null);
  const [pigamesScore, setPigamesScore] = useState(0);
  const [pigamesLives, setPigamesLives] = useState(3);
  const [pigamesCompletedCount, setPigamesCompletedCount] = useState<string[]>([]);
  const [lattesRegistered, setLattesRegistered] = useState(false);
  const [congressRegistered, setCongressRegistered] = useState(false);
  const [congressError, setCongressError] = useState('');
  const [emailChecklist, setEmailChecklist] = useState({ attach: false, subject: false, review: false });

  // --- CONGRESS PORTAL ---
  const handleCongressSubmit = (isRelevant: boolean) => {
      if (isRelevant) {
          setCongressRegistered(true);
          onQuizComplete(30);
          if (onCongressSuccess) onCongressSuccess();
      } else {
          setCongressError('Sua pesquisa em epidemiologia de dados secundários/ecológicos não se enquadra no escopo temático deste congresso cirúrgico/básico. A submissão foi rejeitada pela comissão científica.');
      }
  };

  const renderCongress = () => (
      <div className="bg-slate-50 h-full text-slate-800 flex flex-col overflow-y-auto font-sans">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 flex justify-between items-center shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                  <Globe size={32} />
                  <div>
                      <h2 className="text-lg font-black font-serif tracking-wide leading-none">CongressoHub</h2>
                      <p className="text-[10px] text-slate-200 tracking-wider">REDE DE EVENTOS ACADÊMICOS</p>
                  </div>
              </div>
          </div>
          
          <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
              {currentStep < EcologicalStep.CONGRESS_SUBMISSION ? (
                  <div className="flex flex-col items-center justify-center text-center mt-20">
                      <Lock size={48} className="text-slate-400 mb-4" />
                      <h3 className="font-bold text-slate-800 mb-2">Congressos Bloqueados</h3>
                      <p className="text-sm text-slate-500">
                          Você precisa primeiro ter seu artigo publicado em uma revista antes de apresentá-lo em congressos.
                      </p>
                  </div>
              ) : congressRegistered ? (
                  <div className="bg-white rounded-xl shadow-xl p-8 border border-green-200 text-center animate-in zoom-in">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle size={48} className="text-green-600"/>
                      </div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-4">Inscrição Aprovada!</h2>
                      <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                          Seu artigo foi aceito para apresentação oral no Congresso Brasileiro de Saúde Pública. Prepare seu banner!
                      </p>
                      <button onClick={() => navigate('lattes')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg">
                          Ir para o Currículo Lattes
                      </button>
                  </div>
              ) : (
                  <div>
                      <h2 className="text-2xl font-bold text-slate-800 mb-6">Congressos com Inscrições Abertas</h2>
                      {congressError && (
                          <div className="bg-red-50 border border-red-300 text-red-800 p-4 rounded-lg mb-6 flex items-start gap-3">
                              <AlertCircle size={20} className="shrink-0 mt-0.5" />
                              <p className="text-sm">{congressError}</p>
                          </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Irrelevant Congress */}
                          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col">
                              <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1 rounded w-max mb-3">Pesquisa Básica</div>
                              <h3 className="text-lg font-bold text-slate-800 mb-2">Simpósio Internacional de Neurocirurgia e Nanotecnologia</h3>
                              <p className="text-sm text-slate-600 mb-6 flex-1">
                                  Foco exclusivo em estudos moleculares, ensaios in vitro e técnicas cirúrgicas robóticas.
                              </p>
                              <button onClick={() => handleCongressSubmit(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded border border-slate-300">
                                  Submeter Trabalho
                              </button>
                          </div>

                          {/* Relevant Congress */}
                          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 flex flex-col">
                              <div className="bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1 rounded w-max mb-3">Saúde Coletiva</div>
                              <h3 className="text-lg font-bold text-slate-800 mb-2">Congresso Brasileiro de Saúde Pública & Epidemiologia</h3>
                              <p className="text-sm text-slate-600 mb-6 flex-1">
                                  Foco em estudos populacionais, análises de dados secundários (DATASUS) e políticas públicas de saúde.
                              </p>
                              <button onClick={() => handleCongressSubmit(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded shadow">
                                  Submeter Trabalho
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
  );
  
  const allEmails = useMemo(() => {
      const merged = [...emails, ...EDUCATIONAL_EMAILS].reduce((acc, current) => {
          const x = acc.find(item => item.id === current.id);
          if (!x) return acc.concat([current]);
          return acc;
      }, [] as Email[]);
      
      return merged.sort((a,b) => {
          const timeA = new Date(a.date).getTime() || 0;
          const timeB = new Date(b.date).getTime() || 0;
          return timeB - timeA;
      });
  }, [emails]);

  // Quiz within Email
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Journal Portal
  const [journalView, setJournalView] = useState<'list' | 'submitting' | 'success' | 'rejected'>('list');
  const [rejectReason, setRejectReason] = useState('');

  const getUrlForState = (state: string) => {
      if(state === 'home') return 'https://piggle.com';
      if(state === 'datasus') return 'https://datasus.saude.gov.br/tabnet';
      if(state === 'pubmed') return 'https://pubmed.ncbi.nlm.nih.gov';
      if(state === 'mail') return 'https://webmail.pig4.med.br';
      if(state === 'journal') return 'https://periodicos.capes.gov.br/submissao';
      if(state === 'youtube') return 'https://youtube.com/c/mandictalks';
      if(state === 'pigames') return 'https://pigames.com.br';
      if(state === 'lattes') return 'http://lattes.cnpq.br';
      return state;
  }

  // Safe Date Formatters
  const formatDate = (dateInput: any) => {
      try {
          const d = new Date(dateInput);
          if (isNaN(d.getTime())) return "Data desconhecida";
          return d.toLocaleDateString();
      } catch (e) {
          return "Data inválida";
      }
  };

  const formatTime = (dateInput: any) => {
      try {
          const d = new Date(dateInput);
          if (isNaN(d.getTime())) return "";
          return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
      } catch (e) {
          return "";
      }
  };

  const navigate = (target: string, newHistory = true) => {
    setIsLoading(true);
    setGeneratedData(null);
    setSelectedArticle(null);
    
    if (newHistory) {
        const newStack = history.slice(0, historyIndex + 1);
        newStack.push(target);
        setHistory(newStack);
        setHistoryIndex(newStack.length - 1);
    }
    
    setTimeout(() => {
        if (target.includes('datasus')) {
            setTabnetStep('system_select');
        }
        else if (target.includes('mail')) {
            setMailView('inbox');
        }
        else if (target.includes('journal')) {
            setJournalView('list');
        }
        else if (target.includes('pigames')) {
            setPigamesCategory(null);
            setPigamesAnswered(false);
            setPigamesSelectedOption(null);
            setPigamesFeedback(null);
        }
        
        setInputUrl(getUrlForState(target));
        setIsLoading(false);
    }, 600);
  };

  const handleBack = () => {
      if (historyIndex > 0) {
          setHistoryIndex(prev => prev - 1);
          const prevPage = history[historyIndex - 1];
          setIsLoading(true);
          setTimeout(() => {
            if (prevPage.includes('datasus')) setTabnetStep('system_select');
            setInputUrl(getUrlForState(prevPage));
            setIsLoading(false);
          }, 300);
      }
  };

  const handleForward = () => {
      if (historyIndex < history.length - 1) {
          setHistoryIndex(prev => prev + 1);
           const nextPage = history[historyIndex + 1];
           setIsLoading(true);
           setTimeout(() => {
               setInputUrl(getUrlForState(nextPage));
               setIsLoading(false);
           }, 300);
      }
  };

  // --- TABNET & PUBMED LOGIC (Keep existing) ---
  const handleTabnetGenerate = async () => {
    setIsLoading(true);
    try {
      const data = await generateTabnetData(disease, region, rowVar, colVar, selectedSystem);
      setGeneratedData(data);
      setTabnetStep('result');
    } catch (e) {
      alert("Erro ao conectar com o servidor DATASUS.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchPubMed = async () => {
      if (!searchQuery.match(/\b(AND|OR|NOT)\b/)) {
          setShowSearchError(true);
          onLogAction('badSearchQueries');
          return;
      }
      setIsLoading(true);
      const results = await searchPubMed(searchQuery);
      setArticles(results);
      setIsLoading(false);
  };

  const handleDownloadData = () => {
      if(!generatedData) return;
      setIsDownloading(true);
      setTimeout(() => {
        const newFile: VirtualFile = {
            id: Date.now().toString(),
            name: `${selectedSystem}_${disease.replace(/\s/g,'_')}.csv`,
            type: 'csv',
            folder: 'downloads',
            content: generatedData,
            createdAt: new Date()
        };
        onSaveFile(newFile);
        setIsDownloading(false);
      }, 2000);
  };

  // --- MAIL LOGIC ---
  const openEmail = (email: Email) => {
      setSelectedEmail(email);
      setMailView('read');
      setQuizSelectedOption(null);
      setQuizFeedback(null);
  };

  const handleQuizSubmit = () => {
      if (!selectedEmail?.quiz || quizSelectedOption === null) return;
      
      if (quizSelectedOption === selectedEmail.quiz.correctIdx) {
          setQuizFeedback("Correto! " + selectedEmail.quiz.explanation);
          if (!selectedEmail.quizSolved) {
              onQuizComplete(30);
          }
      } else {
          setQuizFeedback("Incorreto. Tente novamente.");
          onLogAction('quizMistakes');
      }
  };

  const handleChecklistSubmit = () => {
      setShowChecklist(false);
      if (!attachment) {
          alert("Você precisa anexar o seu Artigo (.doc) antes de enviar.");
          return;
      }
      onEmailSend(attachment.id);
      setMailView('inbox');
      setEmailBody('');
      setEmailSubject('');
      setAttachment(null);
  };

  const handleAttach = (file: VirtualFile) => {
      if(file.type === 'doc') {
          setAttachment(file);
          setShowAttachModal(false);
      } else {
          alert("Por favor, anexe apenas o arquivo .doc do manuscrito.");
      }
  };

  // --- PUBMED LOGIC EXTENDED ---
  const checkABNT = () => {
      if (abntSelectedIdx === 1) {
          setAbntResult('correct');
          if (selectedArticle) {
              setVerifiedArticles(prev => [...prev, selectedArticle.id]);
          }
      } else {
          setAbntResult('incorrect');
      }
  };

  const toggleSaveArticle = (article: ArticleHit) => {
      if (!verifiedArticles.includes(article.id) && !isSaved(article.id)) {
          alert("Você precisa validar a referência ABNT antes de salvar este artigo na biblioteca.");
          return;
      }
      if (!article.isGoodStudy) {
          alert("Aviso: Você salvou um artigo com viés metodológico grave (viesado/fraco). Lembre-se de fazer as devidas ressalvas críticas ao citá-lo no seu manuscrito para não generalizar ou ser injusto!");
      }
      onSaveReference(article);
  };

  const isSaved = (id: string) => savedReferences.some(r => r.id === id);

  // --- JOURNAL PORTAL LOGIC ---
  const submitToJournal = (type: 'predatory' | 'elite' | 'safe' | 'hidden_predatory') => {
      setJournalView('submitting');
      
      setTimeout(() => {
          if (type === 'predatory') {
              setRejectReason("ALERTA: Revista Predatória Detectada!\n\nEsta revista cobra taxas abusivas (R$ 2.500), promete publicação em 24h e não possui revisão por pares real. Isso invalidaria seu trabalho acadêmico.");
              onLogAction('predatorySubmission', true);
              setJournalView('rejected');
          } else if (type === 'hidden_predatory') {
              setRejectReason("CUIDADO: Revista Falsa Detectada.\n\nO nome parece sério, mas o site não mostra indexação real no Scopus/PubMed (apenas 'Index Copernicus') e pede pagamento adiantado. É um golpe comum.");
              onLogAction('predatorySubmission', true);
              setJournalView('rejected');
          } else if (type === 'elite') {
              setRejectReason("REJEITADO: Escopo Inadequado.\n\nThe Lancet recebe milhares de artigos. Estudos ecológicos simples de simulação raramente são aceitos aqui. Tente uma revista nacional qualis A2/B1.");
              setJournalView('rejected');
          } else {
              setJournalView('success');
              setTimeout(onJournalSubmit, 2000);
          }
      }, 2500);
  };

  // --- RENDERS ---
  const renderTabnet = () => (
    <div className="h-full bg-[#e6e6e6] font-sans text-sm flex flex-col">
        <div className="bg-[#005a9c] text-white px-4 py-2 flex justify-between items-center shadow-md border-b-4 border-[#fcbf00]">
            <div className="flex items-center gap-2">
                <ShieldCheck size={20}/>
                <span className="font-bold text-lg tracking-wide font-serif">DATASUS</span>
            </div>
            <div className="text-xs font-mono text-white/80">TABNET v.3.02</div>
        </div>
        <div className="p-4 flex-1 overflow-auto bg-[#dcdcdc]">
            {tabnetStep === 'system_select' && (
                <div className="max-w-4xl mx-auto bg-white border-2 border-slate-500 shadow-md p-8">
                    <h2 className="text-blue-900 font-bold text-xl mb-6 border-b-2 border-blue-900 pb-2 font-serif">Informações de Saúde (TABNET)</h2>
                    <div className="grid gap-4 grid-cols-1">
                        <p className="text-slate-800 mb-2 font-bold bg-slate-100 p-2 border border-slate-300">Selecione o grupo de informações:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => {setSelectedSystem('SIM'); setTabnetStep('config')}} className="text-left p-4 border border-slate-400 hover:bg-blue-50 hover:border-blue-600 transition-colors flex items-start gap-4 group bg-white shadow-sm">
                                <div>
                                    <div className="font-bold text-blue-800 group-hover:underline text-md">Estatísticas Vitais - Mortalidade (SIM)</div>
                                </div>
                            </button>
                            <button onClick={() => {setSelectedSystem('SINASC'); setTabnetStep('config')}} className="text-left p-4 border border-slate-400 hover:bg-blue-50 hover:border-blue-600 transition-colors flex items-start gap-4 group bg-white shadow-sm">
                                <div>
                                    <div className="font-bold text-blue-800 group-hover:underline text-md">Nascidos Vivos (SINASC)</div>
                                </div>
                            </button>
                        </div>
                        <button onClick={() => {setSelectedSystem('SINAN'); setTabnetStep('config')}} className="text-left p-4 border border-slate-400 hover:bg-blue-50 hover:border-blue-600 transition-colors flex items-start gap-4 group bg-white shadow-sm">
                            <div>
                                <div className="font-bold text-blue-800 group-hover:underline text-md">Agravos de Notificação (SINAN)</div>
                            </div>
                        </button>
                         <button onClick={() => {setSelectedSystem('SIH'); setTabnetStep('config')}} className="text-left p-4 border border-slate-400 hover:bg-blue-50 hover:border-blue-600 transition-colors flex items-start gap-4 group bg-white shadow-sm">
                            <div>
                                <div className="font-bold text-blue-800 group-hover:underline text-md">Morbidade Hospitalar (SIH/SUS)</div>
                            </div>
                        </button>
                    </div>
                </div>
            )}
             {tabnetStep === 'config' && (
                 <div className="max-w-5xl mx-auto bg-white border border-slate-400 shadow-md flex flex-col h-full">
                    <div className="bg-slate-200 px-4 py-1 border-b border-slate-400 text-xs flex gap-2 items-center">
                         <button className="text-blue-800 font-bold hover:underline" onClick={() => setTabnetStep('system_select')}>Início</button> 
                         <span className="text-slate-500">&gt;</span>
                         <span className="text-slate-700 font-bold uppercase">{selectedSystem}</span>
                    </div>
                    <div className="flex flex-1 bg-slate-100">
                        <div className="w-72 border-r border-slate-300 p-4 space-y-6 text-xs">
                            <div className="bg-white border border-slate-300 p-2">
                                <div className="font-bold text-slate-800 mb-2 bg-slate-200 p-1">Linha (X)</div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2"><input type="radio" checked={rowVar === 'Município'} onChange={() => setRowVar('Município')} /> Município</label>
                                    <label className="flex items-center gap-2"><input type="radio" checked={rowVar === 'Ano'} onChange={() => setRowVar('Ano')} /> Ano do Evento</label>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-300 p-2">
                                <div className="font-bold text-slate-800 mb-2 bg-slate-200 p-1">Coluna (Y)</div>
                                <div className="space-y-1">
                                    <label className="flex items-center gap-2"><input type="radio" checked={colVar === 'Ano'} onChange={() => setColVar('Ano')} /> Ano do Evento</label>
                                    <label className="flex items-center gap-2"><input type="radio" checked={colVar === 'Sexo'} onChange={() => setColVar('Sexo')} /> Sexo</label>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-300 p-2">
                                <div className="font-bold text-slate-800 mb-2 bg-slate-200 p-1">Conteúdo</div>
                                <select value={disease} onChange={(e) => setDisease(e.target.value)} className="w-full border border-slate-400 rounded-none px-1 py-1">
                                    <option value="Dengue">Dengue (Casos Confirmados)</option>
                                    <option value="Tuberculose">Tuberculose</option>
                                    <option value="AIDS">AIDS</option>
                                    <option value="Hanseníase">Hanseníase</option>
                                    <option value="Mortalidade Infantil">Óbitos Infantis</option>
                                    <option value="Mortalidade Geral">Óbitos Gerais</option>
                                    <option value="Internações por Asma">Internações (Asma)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex-1 p-8 bg-white flex flex-col items-center justify-center border-l border-slate-300">
                             <h3 className="text-xl font-serif text-slate-600 mb-4 border-b-2 border-slate-200 pb-2 px-10">Filtros da Pesquisa</h3>
                            <div className="bg-yellow-50 border border-yellow-200 p-4 mb-8 text-xs text-yellow-800 max-w-md text-center shadow-sm">
                                <strong>Abrangência Geográfica:</strong> {region}
                            </div>
                            <button onClick={handleTabnetGenerate} className="bg-slate-100 border-2 border-slate-300 px-8 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 hover:border-slate-400 active:border-slate-500 shadow-sm active:shadow-inner transition-all">
                                MOSTRAR DADOS
                            </button>
                        </div>
                    </div>
                 </div>
            )}
            {tabnetStep === 'result' && generatedData && (
                 <div className="max-w-5xl mx-auto bg-white border border-slate-400 shadow-sm flex flex-col h-full">
                    <div className="bg-slate-200 px-4 py-1 border-b border-slate-300 text-xs flex justify-between items-center">
                         <span className="text-blue-800 font-bold cursor-pointer hover:underline" onClick={() => setTabnetStep('config')}>&lt; Voltar para Seleção</span>
                         <span className="font-bold text-slate-700">{generatedData.title}</span>
                    </div>
                    <div className="p-4 overflow-auto bg-white font-mono text-xs border-b border-slate-300">
                         <table className="w-full border-collapse border-2 border-slate-600">
                                <thead>
                                    <tr className="bg-slate-300 text-slate-800">
                                        <th className="border border-slate-500 p-2 text-left">{rowVar}</th>
                                        {generatedData.columns.map(c => <th key={c} className="border border-slate-500 p-2 text-right">{c}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {generatedData.rows.map((r, i) => (
                                        <tr key={i} className="even:bg-slate-100 hover:bg-yellow-50">
                                            <td className="border border-slate-400 p-1 px-2 font-bold">{r.label}</td>
                                            {r.values.map((v, j) => <td key={j} className="border border-slate-400 p-1 px-2 text-right">{v}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                    </div>
                    <div className="p-4 bg-slate-100 flex justify-between items-center">
                         <div className="text-[10px] text-slate-500">
                            Fonte: {generatedData.source}<br/>
                            Data da consulta: {new Date().toLocaleDateString()}
                         </div>
                         <button onClick={handleDownloadData} disabled={isDownloading} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-400 hover:bg-slate-50 text-xs font-bold rounded shadow-sm disabled:opacity-50">
                             {isDownloading ? <Loader2 className="animate-spin" size={14}/> : <Download size={14} className="text-green-600" />} 
                             {isDownloading ? "Processando..." : "Copiar para .CSV"}
                         </button>
                    </div>
                 </div>
            )}
        </div>
         {isDownloading && (
            <div className="absolute bottom-4 right-4 bg-white border border-slate-300 shadow-xl p-4 rounded-lg flex items-center gap-3 w-80 animate-in slide-in-from-bottom-10 z-50">
                <div className="bg-green-100 p-2 rounded-full">
                    <Download className="text-green-600 animate-bounce" size={20}/>
                </div>
                <div className="flex-1">
                    <div className="text-sm font-bold text-slate-800">Baixando arquivo...</div>
                    <div className="text-xs text-slate-500">{selectedSystem}_{disease.substring(0,10)}.csv</div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-green-500 h-full animate-[shimmer_1.5s_infinite] w-1/2"></div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderPubMed = () => (
    <div className="h-full bg-white flex flex-col font-sans relative">
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
                <span className="font-serif font-bold text-2xl text-[#003366]">PubMed</span>
                <span className="text-xs font-light text-slate-400">.gov</span>
            </div>
            <div className="text-xs text-slate-500">National Library of Medicine</div>
        </div>

        <div className="bg-[#f1f1f1] p-8 border-b border-slate-300">
            <div className="max-w-4xl mx-auto">
                <div className="flex shadow-sm">
                    <input 
                        className="flex-1 px-4 py-3 text-slate-900 outline-none border border-slate-300 border-r-0 rounded-l"
                        placeholder="Search PubMed (Use AND, OR, NOT)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchPubMed()}
                    />
                    <button className="bg-[#005a9c] text-white px-8 py-3 font-bold rounded-r hover:bg-[#004a80] flex items-center gap-2" onClick={handleSearchPubMed}>
                        <Search size={18}/> Search
                    </button>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 text-center">
                    ⚠️ Operadores Booleanos devem estar em <strong>CAIXA ALTA</strong> (Ex: AND, OR, NOT).
                </div>
                <div className="flex justify-between mt-2">
                    <button onClick={() => setShowAdvancedSearch(true)} className="text-xs text-[#005a9c] hover:underline cursor-pointer flex items-center gap-1 font-bold">
                        <span>Advanced Search</span>
                    </button>
                    <button onClick={() => setShowSearchTips(true)} className="text-xs font-bold text-slate-600 flex items-center gap-1 hover:text-blue-600">
                        <HelpCircle size={14}/> Estratégias de Busca
                    </button>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-auto bg-white p-6">
             {selectedArticle ? (
                <div className="max-w-4xl mx-auto animate-in fade-in">
                    <button onClick={() => setSelectedArticle(null)} className="text-[#005a9c] text-sm hover:underline mb-6 flex items-center gap-1"><ArrowLeft size={14}/> Back to results</button>
                    
                    <div className="flex gap-4 items-start">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{selectedArticle.title}</h1>
                            <div className="text-sm text-slate-600 mb-4">{selectedArticle.authors}</div>
                            <div className="bg-slate-50 border border-slate-200 p-3 text-sm mb-6 rounded inline-block">
                                <span className="font-bold text-slate-700">{selectedArticle.journal}</span>. {selectedArticle.year}. <span className="text-slate-500">doi: 10.1016/j.sim.2023.01</span>
                            </div>
                            {/* Metodologia Analisada */}
                            <div className={`p-4 rounded-lg mb-6 border ${
                                selectedArticle.isGoodStudy 
                                    ? 'bg-green-50 border-green-200 text-green-950' 
                                    : 'bg-amber-50 border-amber-300 text-amber-950'
                            }`}>
                                <h4 className="font-bold text-xs uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                    {selectedArticle.isGoodStudy ? (
                                        <>
                                            <ShieldCheck size={16} className="text-green-600" />
                                            Estudo de Alta Qualidade Metodológica (Evidência Forte)
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle size={16} className="text-amber-600 animate-pulse" />
                                            Alerta de Viés Metodológico Grave (Evidência Fraca)
                                        </>
                                    )}
                                </h4>
                                <p className="text-xs leading-relaxed">
                                    {selectedArticle.isGoodStudy 
                                        ? "Este artigo apresenta rigor metodológico adequado, grupo de comparação controle balanceado, e análises estatísticas robustas. Excelente para embasamento científico." 
                                        : `Atenção: ${selectedArticle.flawDescription || "Este estudo possui falhas graves no desenho experimental ou na coleta de dados agregados, o que compromete a validade interna de suas conclusões e pode introduzir viés ecológico severo."}`
                                    }
                                </p>
                            </div>

                            <h3 className="font-bold text-slate-800 uppercase text-sm mb-2 border-b pb-1">Abstract</h3>
                            <p className="text-slate-800 leading-relaxed text-justify mb-6 text-sm">{selectedArticle.abstract}</p>
                        </div>
                        <div className="w-64 space-y-3">
                             <button 
                                onClick={() => toggleSaveArticle(selectedArticle)} 
                                disabled={isSaved(selectedArticle.id) && true}
                                className={`w-full flex items-center justify-center gap-2 px-3 py-3 border rounded shadow-sm text-sm font-bold transition-all 
                                    ${isSaved(selectedArticle.id) ? 'bg-green-50 border-green-500 text-green-700' : verifiedArticles.includes(selectedArticle.id) ? 'bg-blue-600 border-transparent text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                                `}
                            >
                                {isSaved(selectedArticle.id) ? <BookmarkCheck size={16}/> : verifiedArticles.includes(selectedArticle.id) ? <Bookmark size={16}/> : <Lock size={14}/>}
                                {isSaved(selectedArticle.id) ? "Salvo na Biblioteca" : "Salvar na Biblioteca"}
                            </button>
                            
                            <div className="border border-slate-200 rounded p-3 shadow-sm">
                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-2">Actions</div>
                                <button onClick={() => {setShowAbntModal(true); setAbntResult(null); setAbntSelectedIdx(null);}} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-500 text-blue-600 rounded hover:bg-blue-50 text-sm font-bold transition-colors">
                                    <Quote size={14}/> Cite (ABNT)
                                </button>
                                {!verifiedArticles.includes(selectedArticle.id) && !isSaved(selectedArticle.id) && (
                                    <div className="text-[10px] text-orange-600 mt-2 text-center leading-tight">
                                        * Você deve citar (ABNT) antes de salvar.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto">
                    {articles.length > 0 && <div className="text-sm text-slate-500 mb-4">{articles.length} results</div>}
                     {articles.map((art, idx) => (
                        <div key={art.id} className="border-b border-slate-100 pb-6 mb-6 last:border-0">
                            <span className="text-xs text-slate-400 mb-1 block">{idx + 1}. {art.journal}</span>
                            <a onClick={() => setSelectedArticle(art)} className="text-[#005a9c] font-bold text-lg hover:underline cursor-pointer block mb-2 leading-snug">{art.title}</a>
                            <div className="text-sm text-slate-600 mb-2">{art.authors}</div>
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-slate-500 line-clamp-2 flex-1">{art.abstract}</div>
                                {isSaved(art.id) && <BookmarkCheck size={16} className="text-green-600" />}
                            </div>
                        </div>
                    ))}
                    {articles.length === 0 && !isLoading && (
                        <div className="text-center text-slate-400 mt-10">
                            <BookOpen size={48} className="mx-auto mb-4 opacity-20"/>
                            <p>Enter keywords like "Dengue AND Brazil" to find papers.</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {showSearchError && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-l-8 border-red-500 animate-in shake">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-red-800 flex items-center gap-2"><AlertCircle/> Busca Inadequada</h3>
                    </div>
                    <div className="space-y-3 text-sm text-slate-700">
                        <p>Para realizar uma busca científica de qualidade, você <strong>NÃO</strong> pode digitar uma frase solta ou apenas palavras.</p>
                        <p>Você deve usar <strong>Operadores Booleanos</strong> para conectar os conceitos:</p>
                        <ul className="bg-red-50 p-3 rounded space-y-1 text-red-900 font-mono text-xs">
                            <li>"Dengue Brazil" &rarr; ❌ ERRADO</li>
                            <li>"Dengue <strong>AND</strong> Brazil" &rarr; ✅ CORRETO</li>
                        </ul>
                        <p className="text-xs text-slate-500 italic">O sistema bloqueou sua busca para garantir o aprendizado.</p>
                    </div>
                    <button onClick={() => setShowSearchError(false)} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded mt-6 font-bold shadow-lg">Entendi, vou corrigir</button>
                </div>
            </div>
        )}

        {showSearchTips && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-lg text-blue-900">Academia de Busca Científica</h3>
                        <button onClick={() => setShowSearchTips(false)}><X size={20}/></button>
                    </div>
                    <div className="space-y-4 text-sm text-slate-700">
                        <div className="p-3 bg-blue-50 rounded border border-blue-100">
                            <strong className="text-blue-800 block mb-1">Operadores Booleanos (AND, OR, NOT)</strong>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>AND:</strong> Interseção. Ex: "Dengue AND Brazil" (Retorna artigos com ambos).</li>
                                <li><strong>OR:</strong> União. Ex: "Dengue OR Zika" (Retorna qualquer um dos dois).</li>
                                <li><strong>NOT:</strong> Exclusão. Ex: "Dengue NOT Vaccine" (Remove artigos sobre vacina).</li>
                            </ul>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded border border-yellow-100">
                            <strong className="text-yellow-800 block mb-1">Aspas e Truncagem</strong>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>" ":</strong> Busca termo exato. Ex: "Infant Mortality".</li>
                                <li><strong>*:</strong> Busca variações. Ex: Child* (Encontra Child, Children, Childhood).</li>
                            </ul>
                        </div>
                    </div>
                    <button onClick={() => setShowSearchTips(false)} className="w-full bg-slate-800 text-white py-2 rounded mt-6 font-bold">Entendi!</button>
                </div>
            </div>
        )}

        {showAdvancedSearch && (
            <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in">
                    {/* Header */}
                    <div className="bg-[#003366] text-white px-6 py-4 flex justify-between items-center">
                        <h3 className="font-serif font-bold text-lg">
                            <span>PubMed Advanced Search Builder</span>
                        </h3>
                        <button onClick={() => setShowAdvancedSearch(false)} className="text-slate-300 hover:text-white transition-colors cursor-pointer">
                            <X size={20}/>
                        </button>
                    </div>

                    {/* Form Builder */}
                    <div className="p-6 space-y-4 text-slate-700">
                        <p className="text-xs text-slate-500">
                            Use o construtor abaixo para criar uma estratégia de busca refinada e evitar buscas genéricas ou inválidas.
                        </p>

                        {/* Term 1 */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">Termo 1 (Ex: Dengue)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    placeholder="Ex: Dengue"
                                    value={advTerm1}
                                    onChange={(e) => setAdvTerm1(e.target.value)}
                                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                                />
                                <select 
                                    value={advField1}
                                    onChange={(e) => setAdvField1(e.target.value)}
                                    className="w-36 bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 text-xs text-slate-700 font-mono"
                                >
                                    <option value="All Fields">Qualquer Campo</option>
                                    <option value="[Title/Abstract]">Título/Resumo</option>
                                    <option value="[Mesh]">MeSH Terms</option>
                                    <option value="[Author]">Autor</option>
                                    <option value="[Journal]">Periódico</option>
                                </select>
                            </div>
                        </div>

                        {/* Logical Operator */}
                        <div className="flex items-center justify-center">
                            <div className="bg-slate-100 border border-slate-200 rounded-full px-4 py-1 text-xs font-bold text-slate-700 flex items-center gap-2">
                                <span>Operador lógico:</span>
                                <select 
                                    value={advOp}
                                    onChange={(e) => setAdvOp(e.target.value)}
                                    className="bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-900 font-bold"
                                >
                                    <option value="AND">AND (E)</option>
                                    <option value="OR">OR (OU)</option>
                                    <option value="NOT">NOT (NÃO)</option>
                                </select>
                            </div>
                        </div>

                        {/* Term 2 */}
                        <div className="space-y-1">
                            <label className="block text-xs font-bold text-slate-700">Termo 2 (Ex: Brazil)</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    placeholder="Ex: Brazil"
                                    value={advTerm2}
                                    onChange={(e) => setAdvTerm2(e.target.value)}
                                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                                />
                                <select 
                                    value={advField2}
                                    onChange={(e) => setAdvField2(e.target.value)}
                                    className="w-36 bg-slate-50 border border-slate-300 rounded-lg px-2 py-2 text-xs text-slate-700 font-mono"
                                >
                                    <option value="All Fields">Qualquer Campo</option>
                                    <option value="[Title/Abstract]">Título/Resumo</option>
                                    <option value="[Mesh]">MeSH Terms</option>
                                    <option value="[Author]">Autor</option>
                                    <option value="[Journal]">Periódico</option>
                                </select>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1 text-slate-700">
                            <div className="text-[10px] text-slate-400 uppercase font-bold font-mono">Fórmula Final de Busca</div>
                            <div className="font-mono text-xs text-[#003366] font-bold break-all bg-white p-2 rounded border border-slate-150">
                                {(() => {
                                    const f1 = advField1 === 'All Fields' ? '' : advField1;
                                    const f2 = advField2 === 'All Fields' ? '' : advField2;
                                    const p1 = advTerm1 ? `(${advTerm1}${f1})` : '';
                                    const p2 = advTerm2 ? `(${advTerm2}${f2})` : '';
                                    if (p1 && p2) return `${p1} ${advOp} ${p2}`;
                                    return p1 || p2 || '(Fórmula vazia)';
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-2 border-t border-slate-200">
                        <button 
                            onClick={() => {
                                setAdvTerm1('');
                                setAdvTerm2('');
                            }}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Limpar
                        </button>
                        <button 
                            onClick={async () => {
                                const f1 = advField1 === 'All Fields' ? '' : advField1;
                                const f2 = advField2 === 'All Fields' ? '' : advField2;
                                const p1 = advTerm1 ? `(${advTerm1}${f1})` : '';
                                const p2 = advTerm2 ? `(${advTerm2}${f2})` : '';
                                const query = (p1 && p2) ? `${p1} ${advOp} ${p2}` : (p1 || p2 || '');
                                
                                if (!query) return;
                                
                                setSearchQuery(query);
                                setShowAdvancedSearch(false);
                                
                                // Perform the search
                                setIsLoading(true);
                                const results = await searchPubMed(query);
                                setArticles(results);
                                setIsLoading(false);
                            }}
                            disabled={!advTerm1 && !advTerm2}
                            className="bg-[#005a9c] hover:bg-[#004a80] disabled:bg-slate-200 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                        >
                            <Search size={14} />
                            <span>Buscar no PubMed</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {showAbntModal && selectedArticle && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full animate-in zoom-in duration-200">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Quote className="text-blue-500"/> Desafio ABNT</h3>
                        <button onClick={() => setShowAbntModal(false)}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                    </div>
                    
                    {!abntResult ? (
                        <>
                            <p className="text-sm mb-4 text-slate-600">Selecione a formatação correta para citar este artigo nas referências bibliográficas:</p>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => setAbntSelectedIdx(0)} 
                                    className={`w-full text-left text-xs p-4 border rounded transition-all ${abntSelectedIdx === 0 ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}
                                >
                                    <strong>{selectedArticle.title}</strong>. {selectedArticle.authors}. {selectedArticle.journal}, {selectedArticle.year}.
                                </button>
                                <button 
                                    onClick={() => setAbntSelectedIdx(1)} 
                                    className={`w-full text-left text-xs p-4 border rounded transition-all ${abntSelectedIdx === 1 ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {selectedArticle.authors.toUpperCase()}. {selectedArticle.title}. <strong>{selectedArticle.journal}</strong>, {selectedArticle.year}.
                                </button>
                                <button 
                                    onClick={() => setAbntSelectedIdx(2)} 
                                    className={`w-full text-left text-xs p-4 border rounded transition-all ${abntSelectedIdx === 2 ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {selectedArticle.authors}. "{selectedArticle.title}". {selectedArticle.journal}, {selectedArticle.year}.
                                </button>
                            </div>
                            <button onClick={checkABNT} disabled={abntSelectedIdx === null} className="w-full mt-6 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50">Confirmar Resposta</button>
                        </>
                    ) : (
                        <div className="text-center py-6">
                             <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${abntResult === 'correct' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                 {abntResult === 'correct' ? <CheckCircle size={32}/> : <AlertCircle size={32}/>}
                             </div>
                             <h4 className={`font-bold text-xl mb-2 ${abntResult === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                                 {abntResult === 'correct' ? 'Resposta Correta!' : 'Incorreto'}
                             </h4>
                             <p className="text-sm text-slate-600 mb-6">
                                 {abntResult === 'correct' 
                                    ? "Pela norma ABNT NBR 6023, o título do periódico (revista) deve ser destacado em negrito, e os autores em caixa alta." 
                                    : "Pela norma ABNT, o destaque (negrito) vai no título da REVISTA, não do artigo. E os autores devem estar em caixa alta."}
                             </p>
                             <button onClick={() => setShowAbntModal(false)} className="px-6 py-2 bg-slate-800 text-white rounded font-bold">Concluir</button>
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
  
  const renderMail = () => (
      <div className="flex h-full bg-white font-sans">
          <div className="w-64 bg-[#f3f4f6] border-r border-slate-200 flex flex-col">
              <div className="p-4">
                   <button onClick={() => setMailView('compose')} className="w-full bg-[#0078d4] text-white py-2 rounded-sm shadow hover:bg-[#106ebe] flex items-center justify-center gap-2 font-semibold text-sm">
                      <Send size={14} /> Nova Mensagem
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Favoritos</div>
                  <div onClick={() => setMailView('inbox')} className={`px-4 py-2 cursor-pointer flex justify-between items-center text-sm ${mailView === 'inbox' ? 'bg-white text-[#0078d4] font-semibold border-l-4 border-[#0078d4]' : 'text-slate-700 hover:bg-slate-200'}`}>
                      <span className="flex items-center gap-2"><Inbox size={16}/> Caixa de Entrada</span>
                      <span className="text-[#0078d4] text-xs font-bold">{allEmails.filter(e => !e.read).length}</span>
                  </div>
              </div>
          </div>

          {mailView === 'inbox' && (
              <div className="flex-1 bg-white p-0 overflow-y-auto">
                   <div className="p-4 border-b text-xl font-bold text-slate-800">Caixa de Entrada</div>
                   {allEmails.map(email => (
                      <div key={email.id} onClick={() => openEmail(email)} className={`border-b border-slate-100 p-4 hover:bg-slate-50 cursor-pointer group ${!email.read ? 'bg-blue-50/30' : ''}`}>
                          <div className="flex justify-between mb-1">
                              <span className={`text-sm text-slate-800 ${!email.read ? 'font-bold' : ''}`}>{email.from}</span>
                              <span className="text-xs text-slate-400">{formatDate(email.date)}</span>
                          </div>
                          <div className={`text-sm text-[#0078d4] mb-1 ${!email.read ? 'font-semibold' : ''}`}>
                              {email.quiz && !email.quizSolved ? <span className="bg-yellow-400 text-yellow-900 text-[10px] px-1 rounded font-bold mr-2">QUIZ</span> : null}
                              {email.subject}
                          </div>
                          <div className="text-sm text-slate-500 line-clamp-2">{email.body}</div>
                      </div>
                   ))}
              </div>
          )}

          {mailView === 'read' && selectedEmail && (
              <div className="flex-1 flex flex-col bg-white animate-in fade-in">
                  <div className="border-b p-4 flex justify-between items-center bg-slate-50">
                      <button onClick={() => setMailView('inbox')} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 text-sm font-bold"><ArrowLeft size={14}/> Voltar</button>
                      <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Trash2 size={16}/></button>
                      </div>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                      <h2 className="text-xl font-bold text-slate-800 mb-4">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-3 mb-6 border-b pb-4">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">{selectedEmail.from ? selectedEmail.from.charAt(0) : '?'}</div>
                          <div>
                              <div className="font-bold text-sm text-slate-900">{selectedEmail.from}</div>
                              <div className="text-xs text-slate-500">Para: mim</div>
                          </div>
                          <div className="ml-auto text-xs text-slate-400">{formatDate(selectedEmail.date)} {formatTime(selectedEmail.date)}</div>
                      </div>
                      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-8">
                          {selectedEmail.body}
                      </div>

                      {selectedEmail.quiz && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-xl">
                              <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2"><HelpCircle/> Desafio Rápido</h3>
                              <p className="font-bold text-slate-800 mb-4 text-sm">{selectedEmail.quiz.question}</p>
                              
                              {!quizFeedback ? (
                                  <div className="space-y-2">
                                      {selectedEmail.quiz.options.map((opt, idx) => (
                                          <button 
                                            key={idx}
                                            onClick={() => setQuizSelectedOption(idx)}
                                            className={`w-full text-left p-3 rounded border text-sm transition-all ${quizSelectedOption === idx ? 'bg-blue-100 border-blue-400 text-blue-900' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                                          >
                                              {opt}
                                          </button>
                                      ))}
                                      <button 
                                        onClick={handleQuizSubmit}
                                        disabled={quizSelectedOption === null}
                                        className="mt-4 bg-yellow-500 text-yellow-900 px-6 py-2 rounded font-bold text-sm hover:bg-yellow-600 hover:text-white disabled:opacity-50 disabled:hover:bg-yellow-500"
                                      >
                                          Responder
                                      </button>
                                  </div>
                              ) : (
                                  <div className={`p-4 rounded text-sm ${selectedEmail.quiz.correctIdx === quizSelectedOption ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      {quizFeedback}
                                  </div>
                              )}
                          </div>
                      )}

                      {selectedEmail.hasAction && selectedEmail.actionLabel && (
                          <div className="mt-8 border-t pt-6">
                              <button 
                                onClick={() => onEmailSend('BANNER_TRIGGER')} 
                                className="bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700 shadow-lg flex items-center gap-2 animate-pulse"
                              >
                                  <ExternalLink size={16}/> {selectedEmail.actionLabel}
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {mailView === 'compose' && (
              <div className="flex-1 flex flex-col bg-white">
                  <div className="border-b p-3 flex gap-2 items-center">
                      <span className="text-slate-500 text-sm w-12 text-right">Para:</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-sm border border-slate-200 text-slate-700">orientador@pig4.med.br</span>
                  </div>
                  <div className="border-b p-3 flex gap-2 items-center">
                      <span className="text-slate-500 text-sm w-12 text-right">Assunto:</span>
                      <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="flex-1 outline-none text-sm font-bold text-slate-800 placeholder-slate-400" placeholder="Adicione um assunto" />
                  </div>
                  <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} className="flex-1 resize-none p-4 outline-none text-sm font-sans text-slate-800" placeholder="Prezado orientador..."></textarea>
                  
                  {attachment && (
                      <div className="m-4 p-3 bg-blue-50 border border-blue-100 rounded flex items-center justify-between text-sm text-blue-800">
                          <div className="flex items-center gap-2">
                              <FileText size={16}/> {attachment.name}
                          </div>
                          <button onClick={() => setAttachment(null)}><X size={14}/></button>
                      </div>
                  )}

                  <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
                      <button onClick={() => setShowAttachModal(true)} className="text-slate-600 hover:text-blue-600 flex items-center gap-1 text-sm font-semibold"><Paperclip size={16}/> Anexar Arquivo</button>
                      <button onClick={() => setShowChecklist(true)} className="bg-[#0078d4] text-white px-6 py-2 rounded shadow hover:bg-[#106ebe] font-bold text-sm flex items-center gap-2">Enviar <Send size={12}/></button>
                  </div>
              </div>
          )}
          {showAttachModal && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20">
                  <div className="bg-white rounded shadow-xl w-96">
                      <div className="p-3 border-b font-bold text-slate-700 bg-slate-50">Selecionar Arquivo</div>
                      <div className="p-2 max-h-60 overflow-auto">
                          {fileSystem.filter(f => f.folder === 'documents').length === 0 && (
                              <div className="p-4 text-center text-slate-400 text-sm">Nenhum documento encontrado.</div>
                          )}
                          {fileSystem.filter(f => f.folder === 'documents').map(f => (
                              <div key={f.id} onClick={() => handleAttach(f)} className="p-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-sm rounded">
                                  <FileText size={16} className="text-blue-600"/> {f.name}
                              </div>
                          ))}
                      </div>
                      <div className="p-2 border-t flex justify-end"><button onClick={() => setShowAttachModal(false)} className="text-xs text-slate-500 hover:text-red-500 px-2 py-1">Cancelar</button></div>
                  </div>
              </div>
          )}

          {showChecklist && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 backdrop-blur-sm">
                  <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border-t-4 border-yellow-500">
                      <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><HelpCircle className="text-yellow-500"/> Checklist de Envio Rigoroso</h3>
                      <div className="space-y-3 mb-6">
                          <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${emailChecklist.attach ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50'}`}>
                              <input type="checkbox" checked={emailChecklist.attach} onChange={(e) => setEmailChecklist(p => ({...p, attach: e.target.checked}))} className="w-4 h-4 accent-blue-600"/>
                              <span className="text-sm text-slate-700">Anexei o manuscrito final em .doc? <strong className="text-xs text-red-500">*Obrigatório</strong></span>
                          </label>
                          <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${emailChecklist.subject ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50'}`}>
                              <input type="checkbox" checked={emailChecklist.subject} onChange={(e) => setEmailChecklist(p => ({...p, subject: e.target.checked}))} className="w-4 h-4 accent-blue-600"/>
                              <span className="text-sm text-slate-700">Escrevi um assunto claro e texto profissional? <strong className="text-xs text-red-500">*Obrigatório</strong></span>
                          </label>
                          <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${emailChecklist.review ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50'}`}>
                              <input type="checkbox" checked={emailChecklist.review} onChange={(e) => setEmailChecklist(p => ({...p, review: e.target.checked}))} className="w-4 h-4 accent-blue-600"/>
                              <span className="text-sm text-slate-700">Revisei se o artigo contém PICO, Método e Referências? <strong className="text-xs text-red-500">*Obrigatório</strong></span>
                          </label>
                      </div>
                      <div className="flex gap-3">
                          <button onClick={() => setShowChecklist(false)} className="flex-1 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded">Voltar e Revisar</button>
                          <button 
                              onClick={() => {
                                  if (!emailChecklist.attach || !emailChecklist.subject || !emailChecklist.review) {
                                      alert("Atenção: Preencha todos os itens do checklist obrigatório antes de enviar.");
                                      return;
                                  }
                                  handleChecklistSubmit();
                              }} 
                              className={`flex-1 text-white py-2 rounded font-bold text-sm shadow transition-all ${
                                  emailChecklist.attach && emailChecklist.subject && emailChecklist.review 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-slate-400 cursor-not-allowed'
                              }`}
                          >
                              Confirmar Envio Final
                          </button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );

  const renderJournalPortal = () => (
      <div className="h-full bg-slate-50 font-sans flex flex-col">
          <div className="bg-white shadow-sm border-b px-6 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <Book size={24} className="text-purple-700"/>
                  <span className="font-serif text-lg font-bold text-slate-800">Portal de Periódicos</span>
              </div>
              <div className="text-xs text-slate-500">Sistema de Submissão Unificado</div>
          </div>

          <div className="flex-1 p-8 overflow-auto">
              {journalView === 'list' && (
                  <div className="max-w-4xl mx-auto">
                      <h2 className="text-2xl font-bold text-slate-800 mb-6">Escolha uma Revista para Submissão</h2>
                      <p className="mb-6 text-slate-600 text-sm bg-blue-50 p-4 rounded border border-blue-100">
                          <strong>Atenção:</strong> Escolha com sabedoria. Verifique se a revista é indexada, se possui revisão por pares e evite periódicos predatórios que cobram taxas abusivas por aprovação rápida.
                      </p>
                      
                      <div className="grid gap-6">
                          {/* Predatory Journal */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 hover:border-purple-400 transition-all relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1">FAST REVIEW</div>
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h3 className="text-xl font-serif font-bold text-blue-900 mb-1">International Global Medical Science Archive</h3>
                                      <div className="text-xs text-slate-500 mb-4">ISSN: 9999-XXXX • Online Access</div>
                                      <div className="flex gap-4 text-sm text-slate-700 mb-4">
                                          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Aprovação em 24h</span>
                                          <span className="flex items-center gap-1"><DollarSign size={14} className="text-red-500"/> Taxa: R$ 2.500,00</span>
                                      </div>
                                  </div>
                                  <button onClick={() => submitToJournal('predatory')} className="bg-purple-600 text-white px-6 py-2 rounded font-bold text-sm hover:bg-purple-700 shadow">Submeter</button>
                              </div>
                          </div>

                          {/* Legitimate Journal */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 hover:border-green-500 transition-all">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h3 className="text-xl font-serif font-bold text-green-900 mb-1">Revista Brasileira de Epidemiologia</h3>
                                      <div className="text-xs text-slate-500 mb-4">Indexed in SciELO, PubMed • Qualis A2</div>
                                      <div className="flex gap-4 text-sm text-slate-700 mb-4">
                                          <span className="flex items-center gap-1"><GraduationCap size={14} className="text-slate-500"/> Double-Blind Peer Review</span>
                                          <span className="flex items-center gap-1"><DollarSign size={14} className="text-slate-500"/> Taxa: Gratuita / Baixa</span>
                                      </div>
                                  </div>
                                  <button onClick={() => submitToJournal('safe')} className="bg-green-700 text-white px-6 py-2 rounded font-bold text-sm hover:bg-green-800 shadow">Submeter</button>
                              </div>
                          </div>

                          {/* Elite Journal */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 hover:border-slate-500 transition-all opacity-90 hover:opacity-100">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h3 className="text-xl font-serif font-bold text-slate-900 mb-1">The Lancet Global Health</h3>
                                      <div className="text-xs text-slate-500 mb-4">Impact Factor: 25.8 • Qualis A1</div>
                                      <div className="flex gap-4 text-sm text-slate-700 mb-4">
                                          <span className="flex items-center gap-1"><GraduationCap size={14} className="text-slate-500"/> Rigorous Review</span>
                                          <span className="flex items-center gap-1"><AlertCircle size={14} className="text-orange-500"/> Rejeição: 95%</span>
                                      </div>
                                  </div>
                                  <button onClick={() => submitToJournal('elite')} className="bg-slate-800 text-white px-6 py-2 rounded font-bold text-sm hover:bg-slate-900 shadow">Submeter</button>
                              </div>
                          </div>

                          {/* Hidden Predatory Journal */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 hover:border-red-400 transition-all">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h3 className="text-xl font-serif font-bold text-blue-900 mb-1">American Journal of Advanced Science</h3>
                                      <div className="text-xs text-slate-500 mb-4">Index Copernicus • Open Access</div>
                                      <div className="flex gap-4 text-sm text-slate-700 mb-4">
                                          <span className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500"/> Fast Track</span>
                                          <span className="flex items-center gap-1"><DollarSign size={14} className="text-red-500"/> USD 500.00</span>
                                      </div>
                                  </div>
                                  <button onClick={() => submitToJournal('hidden_predatory')} className="bg-blue-600 text-white px-6 py-2 rounded font-bold text-sm hover:bg-blue-700 shadow">Submeter</button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {journalView === 'submitting' && (
                  <div className="h-full flex flex-col items-center justify-center">
                      <Loader2 size={48} className="animate-spin text-purple-600 mb-4"/>
                      <h3 className="text-xl font-bold text-slate-700">Enviando Manuscrito...</h3>
                      <p className="text-slate-500">Aguardando resposta do editor...</p>
                  </div>
              )}

              {journalView === 'rejected' && (
                  <div className="h-full flex flex-col items-center justify-center animate-in shake">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                          <ThumbsDown size={40} className="text-red-600"/>
                      </div>
                      <h2 className="text-3xl font-bold text-red-800 mb-4">Submissão Recusada</h2>
                      <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm max-w-lg text-center">
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line mb-6">{rejectReason}</p>
                          <button onClick={() => setJournalView('list')} className="bg-slate-800 text-white px-6 py-2 rounded font-bold hover:bg-slate-900">Tentar Outra Revista</button>
                      </div>
                  </div>
              )}

              {journalView === 'success' && (
                  <div className="h-full flex flex-col items-center justify-center animate-in zoom-in">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                          <ThumbsUp size={40} className="text-green-600"/>
                      </div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">Aceito para Publicação!</h2>
                      <p className="text-slate-600 max-w-md text-center mb-8">Seu artigo passou pela revisão por pares e foi aceito por sua qualidade metodológica.</p>
                      <div className="text-xs text-slate-400">Redirecionando para certificação...</div>
                  </div>
              )}
          </div>
      </div>
  );

  const renderYoutube = () => (
      <div className="bg-[#0f0f0f] h-full text-white flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="bg-[#212121] h-14 flex items-center px-4 justify-between border-b border-[#3d3d3d] shrink-0">
              <div className="flex items-center gap-2">
                  <Youtube className="text-red-600" size={28} />
                  <span className="font-bold text-lg font-sans tracking-tight">PigTube</span>
              </div>
              <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                  Canal Recomendado de Educação Médica
              </div>
          </div>
          
          <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
              {/* Main Video Section */}
              <div className="flex-1">
                  {/* Video Player Box */}
                  <div className="aspect-video bg-slate-950 rounded-xl relative overflow-hidden group shadow-2xl flex flex-col items-center justify-center border border-[#3d3d3d]">
                      {videoPlaying ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-black">
                              <div className="text-red-500 font-bold text-lg mb-2 animate-pulse flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></div> REPRODUZINDO PODCAST
                              </div>
                              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-red-600 flex items-center justify-center mb-4">
                                  <Youtube size={48} className="text-red-600 animate-bounce" />
                              </div>
                              <h4 className="text-center font-bold text-slate-200">Mandic Talks #04 - Metodologia Científica e Epidemiologia</h4>
                              <p className="text-xs text-slate-400 mt-2 text-center max-w-sm">Tocando áudio do episódio... "O segredo do estudo ecológico é entender que a unidade de observação é uma população, não um indivíduo..."</p>
                              <button onClick={() => setVideoPlaying(false)} className="mt-4 text-xs bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-full transition-all">Pausar</button>
                          </div>
                      ) : (
                          <>
                              <img src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600" alt="Podcast Backdrop" className="absolute inset-0 w-full h-full object-cover opacity-40 filter blur-sm" />
                              <div className="z-10 flex flex-col items-center">
                                  <button onClick={() => setVideoPlaying(true)} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 hover:scale-110 active:scale-95 transition-all text-white flex items-center justify-center shadow-lg cursor-pointer">
                                      <Youtube size={32} fill="currentColor" />
                                  </button>
                                  <span className="text-sm font-bold text-slate-200 mt-4 tracking-wide bg-black/60 px-3 py-1 rounded">Clique para assistir o Podcast</span>
                              </div>
                              <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-3 rounded-lg backdrop-blur z-10 flex justify-between items-center text-xs">
                                  <div className="font-bold">Mandic Talks - Estudos Epidemiológicos com Thales, Leonardo & Theo</div>
                                  <div className="text-slate-300">45:12</div>
                              </div>
                          </>
                      )}
                  </div>
                  
                  {/* Video Title and Author */}
                  <div className="mt-4">
                      <h1 className="text-xl font-bold text-slate-100 font-sans">Mandic Talks Podcast - Ep 04: Estudos Ecológicos e Causalidade na Prática Médica</h1>
                      <div className="flex flex-wrap items-center justify-between mt-3 border-b border-[#3d3d3d] pb-4 gap-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">MT</div>
                              <div>
                                  <h3 className="font-bold text-sm text-slate-100">Mandic Talks</h3>
                                  <p className="text-xs text-slate-400">12.4k inscritos</p>
                              </div>
                              <div className="ml-4">
                                  {isSubscribed ? (
                                      <span className="bg-[#272727] text-green-400 font-bold text-xs px-4 py-2 rounded-full flex items-center gap-1.5 border border-green-500/30">
                                          <CheckCircle size={14}/> Inscrito (Sino Ativo 🔔)
                                      </span>
                                  ) : (
                                      <button onClick={() => {
                                          setIsSubscribed(true);
                                          onQuizComplete(15);
                                          alert("Obrigado por se inscrever no Mandic Talks! Você ganhou +15 XP e terá acesso a novas discussões médicas.");
                                      }} className="bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold text-xs px-4 py-2 rounded-full cursor-pointer">
                                          Inscrever-se no Canal
                                      </button>
                                  )}
                              </div>
                          </div>
                      </div>
                      
                      <div className="mt-4 bg-[#272727] p-4 rounded-xl text-xs text-slate-300 leading-relaxed border border-[#3d3d3d]">
                          <p className="font-bold text-slate-100 mb-1">Publicado em 2026 • 15.392 visualizações</p>
                          Neste episódio do <strong className="text-red-400">Mandic Talks</strong>, nossos convidados Thales, Leonardo e Theo (T7 - A) desmistificam o uso de dados de domínio público (como o DATASUS) e as armadilhas clássicas da estatística e medicina baseada em evidências. Aprenda a não cair no viés de falácia ecológica!
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderPigames = () => {
      const questions = [
          {
              id: "q1",
              category: "Estudos Ecológicos",
              question: "Em um estudo ecológico sobre poluição e asma, descobrimos que cidades mais poluídas têm maior taxa de internação por asma. Podemos afirmar que indivíduos que respiram mais poluição individualmente têm mais asma de fato?",
              options: [
                  "Sim, a associação no nível populacional garante a verdade individual de forma direta.",
                  "Não necessariamente, pois estaríamos cometendo a Falácia Ecológica ao inferir causalidade individual de dados populacionais.",
                  "Sim, desde que o coeficiente de correlação estatística de Pearson seja exatamente 1.0.",
                  "Não, estudos ecológicos servem apenas para testar medicamentos na população."
              ],
              correctIdx: 1,
              explanation: "Correto! A Falácia Ecológica (ou viés de agregação) ocorre quando assumimos que uma associação observada em nível de grupo obrigatoriamente se aplica ao nível individual."
          },
          {
              id: "q2",
              category: "Medicina Baseada em Evidências (MBE)",
              question: "Qual o desenho de estudo considerado o 'Padrão-Ouro' para avaliar a eficácia de uma nova intervenção clínica ou medicamentosa, ocupando o topo das evidências primárias?",
              options: [
                  "Relato de Caso detalhado.",
                  "Estudo Ecológico descritivo.",
                  "Ensaio Clínico Randomizado Controlado.",
                  "Estudo de Coorte retrospectivo sem grupo controle."
              ],
              correctIdx: 2,
              explanation: "Excelente! O Ensaio Clínico Randomizado Controlado (ECR) é o melhor desenho primário para testar causalidade e intervenções porque a randomização evita vieses de seleção."
          },
          {
              id: "q3",
              category: "Bioestatística & Causalidade",
              question: "Um pesquisador encontra um p-valor de 0.002 ao analisar a associação de um medicamento. O que o p-valor realmente significa sob a ótica da Hipótese Nula (H0)?",
              options: [
                  "A chance de que o resultado observado seja fruto do acaso se a Hipótese Nula fosse verdadeira é de apenas 0.2%.",
                  "O medicamento possui exatamente 99.8% de eficácia biológica curativa.",
                  "O estudo possui um viés de subnotificação de exatamente 0.02%.",
                  "A hipótese alternativa está 100% errada."
              ],
              correctIdx: 0,
              explanation: "Exato! O p-valor é a probabilidade de obter resultados tão ou mais extremos que os observados, assumindo que a hipótese nula de nenhuma diferença/associação seja verdadeira."
          },
          {
              id: "q4",
              category: "Vieses em Pesquisa",
              question: "Em um estudo de caso-controle sobre tabagismo e câncer de pulmão, os casos são recrutados de um hospital oncológico de alta complexidade e os controles de uma clínica oftalmológica privada. Que tipo de viés metodológico grave este recrutamento desproporcional introduz?",
              options: [
                  "Viés de Seleção (especificamente o viés de Berkson ou seleção inadequada de controles).",
                  "Viés de Aferição por perda de seguimento temporal.",
                  "Falácia Ecológica por extrapolação populacional desproporcional.",
                  "Nenhum viés relevante, pois ambos os grupos são compostos por adultos."
              ],
              correctIdx: 0,
              explanation: "Correto! O viés de seleção ocorre quando os participantes incluídos não são representativos da população de origem, distorcendo a estimativa de associação entre exposição e desfecho."
          },
          {
              id: "q5",
              category: "Validade Interna",
              question: "Um estudo de coorte observa uma associação estatística forte entre consumo de café e infarto agudo do miocárdio. No entanto, após estratificar a amostra por tabagismo (fumantes vs. não-fumantes), a associação desaparece por completo. O que o tabagismo representa nessa relação original?",
              options: [
                  "Uma variável preditora independente e imutável.",
                  "Um fator de confusão (confundidor), associado tanto ao consumo de café quanto ao infarto, sem ser elo causal direto.",
                  "Um viés de recordação induzido pelo hábito de fumar.",
                  "Um efeito placebo puro decorrente da cafeína."
              ],
              correctIdx: 1,
              explanation: "Perfeito! O tabagismo é um fator de confusão típico aqui, pois fumantes tendem a beber mais café e o fumo é fator de risco direto para infarto. Ajustar ou estratificar revela a verdadeira ausência de causalidade isolada do café."
          },
          {
              id: "q6",
              category: "Ensaios Clínicos",
              question: "Em um Ensaio Clínico Randomizado, o delineamento 'Duplo-Cego' (Double-Blind) assegura que:",
              options: [
                  "Tanto o paciente participante quanto o médico avaliador desconhecem qual intervenção (ativo ou placebo) está sendo aplicada.",
                  "Dois laboratórios farmacêuticos concorrentes auditem a mesma base de dados.",
                  "O estudo tenha sido avaliado por dois comitês de ética regionais independentes.",
                  "Nenhum dos pesquisadores saiba o p-valor estatístico antes do fim do ano fiscal."
              ],
              correctIdx: 0,
              explanation: "Exato! O mascaramento duplo-cego previne viés de aferição pelo examinador e efeitos placebo ou de conformidade pelo voluntário, aumentando drasticamente a validade interna."
          },
          {
              id: "q7",
              category: "Gestão Ágil: Kanban",
              question: "Em um projeto de saúde pública no município de Araras, sua equipe adotou o quadro Kanban para gerenciar a campanha contra Dengue. O que a prática de 'Limitar o Trabalho em Progresso' (WIP) no Kanban pretende resolver?",
              options: [
                  "Evitar que as tarefas sejam visualizadas pelo prefeito.",
                  "Reduzir a sobrecarga da equipe, focar em terminar tarefas abertas e expor rapidamente os gargalos no fluxo de trabalho.",
                  "Garantir atrasos constantes reduzindo as reuniões.",
                  "Substituir totalmente a necessidade de médicos especialistas."
              ],
              correctIdx: 1,
              explanation: "Perfeito! No Kanban, limitar o WIP (Work In Progress) evita sobrecarga, diminui o tempo de ciclo (lead time) e expõe gargalos que precisam de atenção da gestão."
          },
          {
              id: "q8",
              category: "Design Thinking: Araras",
              question: "Ao tentar resolver a alta taxa de mortalidade infantil em um bairro periférico de Araras usando Design Thinking, qual deve ser a PRIMEIRA etapa fundamental da sua equipe de gestão em saúde?",
              options: [
                  "Protótipo rápido: imprimir e distribuir panfletos genéricos sobre saúde sem conversar com os moradores locais.",
                  "Ideação brainstorming: trancar a equipe numa sala e inventar ideias disruptivas sem base no mundo real.",
                  "Testagem técnica: implementar um novo posto de saúde caro de imediato sem validação.",
                  "Empatia e Imersão: ir a campo, escutar ativamente as mães, entender profundamente suas dores, o contexto social e cultural."
              ],
              correctIdx: 3,
              explanation: "Excelente! O Design Thinking é centrado no ser humano. A fase inicial (Empatia/Imersão) é crucial para entender o problema real vivenciado pela comunidade."
          }
      ];

      const currentQuestion = questions.find(q => q.category === pigamesCategory);

      // Web Audio API browser synth sound FX
      const playBeep = (correct: boolean) => {
          try {
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              
              if (correct) {
                  osc.type = 'sine';
                  osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                  osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
                  gain.gain.setValueAtTime(0.12, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.3);
              } else {
                  osc.type = 'sawtooth';
                  osc.frequency.setValueAtTime(220.00, ctx.currentTime); // A3
                  osc.frequency.linearRampToValueAtTime(110.00, ctx.currentTime + 0.22);
                  gain.gain.setValueAtTime(0.12, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                  osc.start();
                  osc.stop(ctx.currentTime + 0.3);
              }
          } catch (e) {
              console.warn("AudioContext blocked/not supported in preview:", e);
          }
      };

      const handleAnswer = (idx: number) => {
          if (pigamesAnswered || pigamesLives <= 0) return;
          setPigamesSelectedOption(idx);
          setPigamesAnswered(true);

          if (currentQuestion) {
              const isCorrect = idx === currentQuestion.correctIdx;
              playBeep(isCorrect);

              if (isCorrect) {
                  const alreadyDone = pigamesCompletedCount.includes(currentQuestion.id);
                  if (!alreadyDone) {
                      setPigamesCompletedCount(prev => [...prev, currentQuestion.id]);
                      setPigamesScore(prev => prev + 20);
                      onQuizComplete(20);
                  }
                  setPigamesFeedback(`Parabéns! Resposta Correta! ${currentQuestion.explanation}`);
              } else {
                  setPigamesLives(prev => Math.max(0, prev - 1));
                  setPigamesFeedback(`Ops, resposta incorreta! A resposta certa era a opção: "${currentQuestion.options[currentQuestion.correctIdx]}". Tente ler os tutoriais no email para fixar o conceito!`);
              }
          }
      };

      const handleResetArena = () => {
          setPigamesLives(3);
          setPigamesScore(0);
          setPigamesCompletedCount([]);
          setPigamesCategory(null);
          setPigamesAnswered(false);
          setPigamesSelectedOption(null);
          setPigamesFeedback(null);
      };

      // Rank mapping
      const getAcademicRank = () => {
          if (pigamesScore >= 100) return "Cientista Sênior Mandic 🏆";
          if (pigamesScore >= 60) return "Pesquisador Pleno 🧬";
          if (pigamesScore >= 20) return "Interno do HC 🏥";
          return "Calouro de Medicina 🩺";
      };

      return (
          <div className="bg-[#0f0e26] h-full text-white flex flex-col overflow-y-auto font-sans">
              {/* Header */}
              <div className="bg-[#18163f] h-14 flex items-center px-6 justify-between border-b border-[#2d296c] shrink-0 shadow-lg">
                  <div className="flex items-center gap-2">
                      <Gamepad2 className="text-yellow-400 animate-pulse" size={24} />
                      <span className="font-extrabold text-sm tracking-widest font-mono text-yellow-300">PIGAMES ARENA</span>
                      <span className="text-[10px] bg-indigo-900 border border-indigo-700/60 px-2 py-0.5 rounded text-indigo-300 font-mono">MBE v2.0</span>
                  </div>
                  
                  {/* Performance Indicators */}
                  <div className="flex items-center gap-5">
                      <div className="text-right">
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Rank Acadêmico</div>
                          <div className="text-xs font-bold text-yellow-400">{getAcademicRank()}</div>
                      </div>
                      <div className="h-6 w-px bg-[#2d296c]"></div>
                      <div className="flex items-center gap-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                              <span key={i} className="text-sm">
                                  {i < pigamesLives ? "❤️" : "🖤"}
                              </span>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Game Over Screen */}
              {pigamesLives === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
                      <div className="text-6xl mb-4">☕💀</div>
                      <h2 className="text-2xl font-black text-red-400 mb-2 font-mono">ARENA BLOQUEADA: FADIGA CIENTÍFICA</h2>
                      <p className="text-xs text-indigo-200 leading-relaxed mb-6">
                          Seu estoque de neurônios e café se esgotou! Você cometeu erros críticos em hipóteses epidemiológicas fundamentais e perdeu suas 3 vidas.
                      </p>
                      <button 
                          onClick={handleResetArena}
                          className="w-full bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg text-sm active:scale-95 cursor-pointer"
                      >
                          Reiniciar Arena & Restaurar Vidas
                      </button>
                  </div>
              ) : !pigamesCategory ? (
                  // Selection Hub
                  <div className="flex-1 p-8 flex flex-col items-center justify-center max-w-3xl mx-auto text-center">
                      <Gamepad2 size={56} className="text-yellow-400 mb-5 animate-bounce" />
                      <h2 className="text-3xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                          Seja bem-vindo à Arena Pigames!
                      </h2>
                      <p className="text-indigo-200 text-xs mb-6 max-w-xl leading-relaxed">
                          Treine seus conhecimentos em Epidemiologia, Estatística e Medicina Baseada em Evidências (MBE). Cada resposta correta garante <strong className="text-yellow-400">+20 XP</strong> para o seu progresso!
                      </p>

                      {/* Cumulative Progress bar */}
                      <div className="w-full bg-indigo-950/80 rounded-2xl p-4 border border-indigo-800/40 mb-6 text-left">
                          <div className="flex justify-between items-center text-xs font-semibold mb-2 font-mono">
                              <span className="text-slate-400">Progresso de Certificação:</span>
                              <span className="text-yellow-400 font-bold">{pigamesScore} / 120 XP</span>
                          </div>
                          <div className="w-full bg-indigo-950 border border-indigo-900 h-2.5 rounded-full overflow-hidden">
                              <div 
                                  className="bg-gradient-to-r from-indigo-500 to-yellow-500 h-full transition-all duration-500"
                                  style={{ width: `${(pigamesScore / 120) * 100}%` }}
                              ></div>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                          {questions.map((q, idx) => {
                              const isCompleted = pigamesCompletedCount.includes(q.id);
                              return (
                                  <button
                                      key={q.id}
                                      onClick={() => {
                                          setPigamesCategory(q.category);
                                          setPigamesAnswered(false);
                                          setPigamesSelectedOption(null);
                                          setPigamesFeedback(null);
                                      }}
                                      className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between group h-36 relative ${
                                          isCompleted 
                                              ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-500' 
                                              : 'bg-indigo-950/40 border-indigo-850 hover:bg-indigo-900/60 hover:border-yellow-500/50'
                                      }`}
                                  >
                                      <div>
                                          <div className="flex justify-between items-start mb-1">
                                              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-mono">Fase 0{idx+1}</span>
                                              {isCompleted && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold font-mono">CONCLUÍDO</span>}
                                          </div>
                                          <h3 className="font-bold text-xs text-slate-100 group-hover:text-white leading-tight">{q.category}</h3>
                                      </div>
                                      <span className="text-[11px] text-indigo-400 group-hover:text-yellow-300 font-mono font-bold flex items-center gap-1">
                                          {isCompleted ? <span className="flex items-center gap-1">Ver Desafio <ArrowRight size={12}/></span> : <span className="flex items-center gap-1">Jogar <ArrowRight size={12}/></span>}
                                      </span>
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              ) : (
                  // Active quiz frame
                  <div className="flex-1 p-6 md:p-8 max-w-2xl mx-auto w-full flex flex-col justify-center">
                      <button onClick={() => setPigamesCategory(null)} className="text-xs text-indigo-300 hover:text-white font-mono mb-4 flex items-center gap-1 cursor-pointer">
                          &larr; Voltar para a Seleção
                      </button>
                      
                      <div className="bg-[#141235] border border-indigo-900/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                          <span className="absolute top-4 right-4 bg-indigo-900/50 text-yellow-400 text-[9px] font-bold px-3 py-1 rounded-lg font-mono border border-indigo-800">
                              {pigamesCategory}
                          </span>
                          
                          <h3 className="text-base font-bold text-white mb-6 leading-relaxed mr-24">
                              {currentQuestion?.question}
                          </h3>
                          
                          <div className="space-y-3">
                              {currentQuestion?.options.map((opt, oIdx) => {
                                  let btnStyle = "bg-[#18163a] hover:bg-[#1d1b4a] border border-indigo-950 text-slate-300";
                                  if (pigamesAnswered) {
                                      if (oIdx === currentQuestion.correctIdx) {
                                          btnStyle = "bg-emerald-950/80 border-2 border-emerald-500 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                                      } else if (pigamesSelectedOption === oIdx) {
                                          btnStyle = "bg-red-950/80 border-2 border-red-500 text-red-200 opacity-85";
                                      } else {
                                          btnStyle = "bg-indigo-950/20 border border-indigo-950 text-slate-500 opacity-30";
                                      }
                                  }
                                  return (
                                      <button
                                          key={oIdx}
                                          disabled={pigamesAnswered}
                                          onClick={() => handleAnswer(oIdx)}
                                          className={`w-full text-left p-3.5 rounded-xl text-xs transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                                      >
                                          <span className="font-mono font-bold text-yellow-400 mt-0.5">{String.fromCharCode(65 + oIdx)}.</span>
                                          <span className="flex-1 leading-normal">{opt}</span>
                                      </button>
                                  );
                              })}
                          </div>

                          {pigamesFeedback && (
                              <div className={`mt-5 p-4 rounded-xl text-xs border animate-in slide-in-from-bottom-2 leading-relaxed ${
                                  pigamesSelectedOption === currentQuestion?.correctIdx 
                                      ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-300' 
                                      : 'bg-red-950/30 border-red-500/20 text-red-300'
                              }`}>
                                  <strong className="block mb-1 font-bold font-mono">Feedback do Professor:</strong>
                                  <p>{pigamesFeedback}</p>
                              </div>
                          )}

                          {pigamesAnswered && (
                              <button onClick={() => setPigamesCategory(null)} className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all text-xs shadow-lg cursor-pointer">
                                  Voltar para a Seleção de Desafios
                              </button>
                          )}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderLattes = () => {
      return (
          <div className="bg-[#f8fafc] h-full text-slate-800 flex flex-col overflow-y-auto font-sans">
              {/* CNPq Lattes Header */}
              <div className="bg-[#1e3a8a] text-white p-4 flex justify-between items-center shrink-0 shadow-md">
                  <div className="flex items-center gap-3">
                      <GraduationCap size={32} className="text-yellow-400" />
                      <div>
                          <h2 className="text-lg font-black font-serif tracking-wide leading-none">Plataforma Lattes</h2>
                          <p className="text-[10px] text-slate-200 tracking-wider">CONSELHO NACIONAL DE DESENVOLVIMENTO CIENTÍFICO E TECNOLÓGICO - CNPq</p>
                      </div>
                  </div>
                  <span className="text-xs font-bold text-yellow-300 bg-blue-950 border border-blue-700 px-3 py-1 rounded">
                      Cadastro de Pesquisadores
                  </span>
              </div>

              {currentStep < EcologicalStep.LATTES_REGISTRATION ? (
                  <div className="flex-1 p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                      <Lock size={48} className="text-indigo-900 mb-4 animate-pulse" />
                      <h3 className="font-bold text-slate-800 mb-2">Currículo Bloqueado</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                          Prezado pesquisador, o cadastro de produções acadêmicas no CNPq é realizado após a publicação em revistas indexadas e apresentação em congressos relevantes.
                      </p>
                      <div className="mt-6 bg-slate-100 p-3 rounded border border-slate-200 text-xs text-slate-600">
                          <strong>Requisito:</strong> Complete o ciclo da escrita, envie o artigo no Portal de Periódicos, participe de um Congresso de Saúde Pública, e libere seu registro!
                      </div>
                  </div>
              ) : (
                  <div className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
                      {/* Lattes User Card */}
                      <div className="bg-white rounded-xl shadow p-6 border border-slate-200 flex gap-6">
                          <div className="w-20 h-20 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-3xl shrink-0 border border-blue-100 shadow-inner">
                              {inputUser ? inputUser.charAt(0) : "E"}
                          </div>
                          <div className="flex-1">
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Pesquisador Cadastrado</span>
                              <h2 className="text-2xl font-bold text-slate-800">{inputUser || "Estudante de Medicina"}</h2>
                              <p className="text-xs text-slate-500 mt-1">Faculdade de Medicina São Leopoldo Mandic</p>
                              <div className="mt-3 flex gap-2">
                                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-mono font-bold">Currículo Lattes ID: 9283748293741</span>
                                  <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-mono font-bold">Status: Ativo</span>
                              </div>
                          </div>
                      </div>

                      {/* Article Registration Area */}
                      <div className="bg-white rounded-xl shadow p-6 border border-slate-200">
                          <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                              <FileText className="text-blue-900" size={18}/> Cadastro de Produção Bibliográfica
                          </h3>

                          {lattesRegistered ? (
                              <div className="bg-green-50 border border-green-300 text-green-800 rounded-xl p-5 animate-in zoom-in">
                                  <div className="flex items-center gap-2 mb-2">
                                      <CheckCircle className="text-green-600" />
                                      <h4 className="font-bold">Artigo Registrado no CNPq!</h4>
                                  </div>
                                  <p className="text-xs leading-relaxed text-green-700">
                                      O artigo foi incluído em seu Currículo Lattes com sucesso sob a modalidade "Artigos completos publicados em periódicos". Sua pontuação acadêmica foi atualizada.
                                  </p>
                                  <div className="mt-4 font-mono text-[10px] text-green-600 uppercase tracking-widest font-bold">
                                      INTEGRAÇÃO CNPQ COMPLETA • +50 XP ADICIONAIS!
                                  </div>
                              </div>
                          ) : (
                              <div className="space-y-4">
                                  <p className="text-xs text-slate-500 leading-relaxed">
                                      Seu manuscrito foi aceito pela revista acadêmica. Clique abaixo para registrar esta produção oficial e aumentar seu índice de citações no ecossistema CNPq.
                                  </p>
                                  
                                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                                      <strong className="block text-slate-700 mb-1">DADOS DA PUBLICAÇÃO ENCONTRADA:</strong>
                                      <div className="text-slate-600 space-y-1">
                                          <div><strong>Título:</strong> Artigo Científico de {inputUser || "Estudante"} (Simulação de Estudos Epidemiológicos)</div>
                                          <div><strong>Periódico:</strong> Revista Brasileira de Epidemiologia (Qualis A2)</div>
                                          <div><strong>Data de Aceite:</strong> {new Date().toLocaleDateString()}</div>
                                          <div><strong>Situação:</strong> Aceito / Publicado</div>
                                      </div>
                                  </div>

                                  <button onClick={() => {
                                      setLattesRegistered(true);
                                      onQuizComplete(50);
                                      alert("Parabéns! Artigo cientificamente certificado e registrado no CNPq com sucesso! Você ganhou +50 XP!");
                                      if (onLattesSuccess) onLattesSuccess();
                                  }} className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm py-3 rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer">
                                      <GraduationCap size={18}/> Registrar Artigo no Lattes & Receber +50 XP
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderHome = () => (
      <div className="bg-slate-100 h-full flex flex-col items-center justify-center p-6 overflow-y-auto">
          <div className="text-4xl font-bold text-slate-800 mb-8 flex items-center gap-3 select-none">
              <Globe size={48} className="text-blue-600" /> Piggle Chrome
          </div>
          <div className="grid grid-cols-3 gap-6 max-w-2xl w-full">
             <div onClick={() => navigate('datasus')} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl">D</div>
                  <span className="text-xs font-bold text-slate-600">DATASUS</span>
             </div>
             <div onClick={() => navigate('pubmed')} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center font-serif font-bold text-xl">P</div>
                  <span className="text-xs font-bold text-slate-600">PubMed</span>
             </div>
             <div onClick={() => navigate('mail')} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border border-slate-200 relative">
                  {allEmails.some(e => !e.read) && <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>}
                  <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl"><Mail size={24}/></div>
                  <span className="text-xs font-bold text-slate-600">Webmail</span>
             </div>
             
             {/* YouTube and Podcast Card */}
             <div onClick={() => navigate('youtube')} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl"><Youtube size={24}/></div>
                  <span className="text-xs font-bold text-slate-600 text-center">Mandic Talks</span>
             </div>

             {/* Pigames Tab */}
             <div onClick={() => navigate('pigames')} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl"><Gamepad2 size={24}/></div>
                  <span className="text-xs font-bold text-slate-600 text-center">Pigames Arcade</span>
             </div>

             {/* Currículo Lattes */}
             <div onClick={() => navigate('lattes')} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 border border-slate-200">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl"><GraduationCap size={24}/></div>
                  <span className="text-xs font-bold text-slate-600 text-center">Currículo Lattes</span>
             </div>

             {/* Journal Portal - Only visible later */}
             {currentStep >= EcologicalStep.JOURNAL_SUBMISSION && (
                 <div onClick={() => navigate('journal')} className="col-span-3 bg-purple-50 hover:bg-purple-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-3 border border-purple-200 animate-in zoom-in">
                      <div className="w-12 h-12 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center font-bold text-xl"><Book size={20}/></div>
                      <div className="text-left animate-pulse">
                          <span className="text-xs font-bold text-purple-800 block">Portal de Periódicos</span>
                          <span className="text-[10px] text-purple-600">Submeta seu manuscrito final para avaliação e aprovação acadêmica</span>
                      </div>
                 </div>
             )}

             {/* Congress Portal - Only visible later */}
             {currentStep >= EcologicalStep.CONGRESS_SUBMISSION && (
                 <div onClick={() => navigate('congress')} className="col-span-3 bg-orange-50 hover:bg-orange-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex items-center justify-center gap-3 border border-orange-200 animate-in zoom-in">
                      <div className="w-12 h-12 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center font-bold text-xl"><Globe size={20}/></div>
                      <div className="text-left animate-pulse">
                          <span className="text-xs font-bold text-orange-800 block">CongressoHub</span>
                          <span className="text-[10px] text-orange-600">Inscreva seu artigo em eventos acadêmicos</span>
                      </div>
                 </div>
             )}
          </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-10 bg-slate-100 flex items-center px-3 gap-3 border-b border-slate-300 shadow-sm z-20">
        <div className="flex gap-2">
             <button onClick={handleBack} disabled={historyIndex <= 0} className="p-1.5 hover:bg-slate-200 rounded cursor-pointer text-slate-600 disabled:opacity-30"><ArrowLeft size={16}/></button>
             <button onClick={handleForward} disabled={historyIndex >= history.length - 1} className="p-1.5 hover:bg-slate-200 rounded cursor-pointer text-slate-600 disabled:opacity-30"><ArrowRight size={16}/></button>
             <button onClick={() => navigate(history[historyIndex], false)} className="p-1.5 hover:bg-slate-200 rounded cursor-pointer text-slate-600"><RefreshCw size={14}/></button>
        </div>
        <div className="flex-1 bg-white h-7 rounded-full flex items-center px-3 text-xs text-slate-600 border border-slate-300 shadow-inner focus-within:ring-2 ring-blue-200 transition-all">
            <Lock size={10} className="mr-2 text-green-600"/> 
            <input value={inputUrl} readOnly className="flex-1 outline-none text-slate-700 cursor-default"/>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
           {isLoading && (
               <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden z-30">
                   <div className="h-full bg-blue-500 animate-[shimmer_1s_infinite] w-1/2"></div>
               </div>
           )}
           {history[historyIndex] === 'datasus' || history[historyIndex].includes('datasus') ? renderTabnet() : 
            history[historyIndex] === 'pubmed' || history[historyIndex].includes('pubmed') ? renderPubMed() : 
            history[historyIndex] === 'mail' || history[historyIndex].includes('mail') ? renderMail() : 
            history[historyIndex] === 'journal' || history[historyIndex].includes('journal') ? renderJournalPortal() : 
            history[historyIndex] === 'congress' || history[historyIndex].includes('congress') ? renderCongress() : 
            history[historyIndex] === 'youtube' || history[historyIndex].includes('youtube') ? renderYoutube() : 
            history[historyIndex] === 'pigames' || history[historyIndex].includes('pigames') ? renderPigames() : 
            history[historyIndex] === 'lattes' || history[historyIndex].includes('lattes') ? renderLattes() : renderHome()}
      </div>
    </div>
  );
};
