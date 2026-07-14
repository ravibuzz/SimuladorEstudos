
import React, { useState, useEffect } from 'react';
import { Monitor, Globe, FileSpreadsheet, FileText, Settings, Power, User, Lock, Folder, ArrowRight, PlayCircle, Lightbulb, XCircle, Award, Trash2, CheckCircle, Briefcase, AlertTriangle, RotateCcw, HelpCircle, BookOpen, Code, Cpu, HeartPulse, BrainCircuit, Camera, WifiOff, Printer, BarChart2, Scale, Microscope } from 'lucide-react';
import { WindowFrame } from './components/ui/WindowFrame';
import { Browser } from './components/apps/Browser';
import { DataStudio } from './components/apps/DataStudio';
import { PaperWriter } from './components/apps/PaperWriter';
import { Tutor } from './components/apps/Tutor';
import { Explorer } from './components/apps/Explorer';
import { BannerDesigner } from './components/apps/BannerDesigner';
import { HealthManagement } from './components/apps/HealthManagement';
import { AppID, WindowState, VirtualFile, Scenario, EcologicalStep, ClipboardItem, Email, ArticleHit, GameStats } from './types';
import { setApiKey, validatePICO } from './services/geminiService';

// Windows Config
const DEFAULT_WINDOWS: Record<AppID, WindowState> = {
  [AppID.GUIDE]: {
    id: AppID.GUIDE,
    title: 'Chatbots de Pesquisa IA',
    isOpen: true, 
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 900, y: 80 },
    size: { width: 350, height: 500 }
  },
  [AppID.BROWSER]: {
    id: AppID.BROWSER,
    title: 'Piggle Chrome',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    position: { x: 50, y: 30 },
    size: { width: 1000, height: 650 }
  },
  [AppID.SHEET]: {
    id: AppID.SHEET,
    title: 'Pigxcel',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 2,
    position: { x: 100, y: 60 },
    size: { width: 900, height: 600 }
  },
  [AppID.WORD]: {
    id: AppID.WORD,
    title: 'Pigword',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 3,
    position: { x: 150, y: 90 },
    size: { width: 800, height: 700 }
  },
  [AppID.SETTINGS]: { 
    id: AppID.SETTINGS,
    title: 'System Info',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 5,
    position: { x: 300, y: 200 },
    size: { width: 500, height: 350 }
  },
  [AppID.EXPLORER]: {
      id: AppID.EXPLORER,
      title: 'Explorador de Arquivos',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 1,
      position: { x: 200, y: 150},
      size: { width: 800, height: 500}
  },
  [AppID.BANNER]: {
      id: AppID.BANNER,
      title: 'Banner Designer Pro',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 6,
      position: { x: 50, y: 50},
      size: { width: 1100, height: 750}
  },
  [AppID.HEALTH_MANAGEMENT]: {
      id: AppID.HEALTH_MANAGEMENT,
      title: 'Sala de Situação SUS',
      isOpen: false,
      isMinimized: false,
      isMaximized: false,
      zIndex: 7,
      position: { x: 40, y: 25 },
      size: { width: 1120, height: 760 }
  }
};

const SCENARIOS: Scenario[] = [
    {
        id: 'dengue_sp',
        title: 'Dossiê Dengue-SP: Urbanização e Dinâmica Espacial de Transmissão',
        description: 'Investigue o padrão espacial da transmissão de Dengue em relação à taxa de urbanização municipal no Estado de São Paulo.',
        objective: 'Coletar dados de incidência de Dengue e analisar se há correlação com a taxa de urbanização dos municípios.',
        correctSystem: 'SINAN',
        recommendedKeywords: ['Dengue', 'Município', 'São Paulo']
    },
    {
        id: 'infant_mortality',
        title: 'Dossiê SIM-Infância: Desigualdade e Mortalidade Infantil',
        description: 'Analise se regiões com menor renda possuem maior mortalidade infantil.',
        objective: 'Identificar tendências de óbitos em menores de 1 ano.',
        correctSystem: 'SIM',
        recommendedKeywords: ['Mortalidade Infantil', 'Nordeste', 'Ano']
    },
    {
        id: 'tb_aids',
        title: 'Dossiê Co-infecção TB-HIV: Padrões de Associação Geográfica e Vulnerabilidade',
        description: 'Estude a correlação geográfica entre casos de Tuberculose e AIDS.',
        objective: 'Verificar se municípios com alta incidência de AIDS também têm alta TB.',
        correctSystem: 'SINAN',
        recommendedKeywords: ['Tuberculose', 'AIDS', 'Município']
    },
    {
        id: 'asthma_poluicao',
        title: 'Dossiê SIH-Asma: Poluição Atmosférica e Taxas de Internação Hospitalar',
        description: 'Estude se as internações por asma apresentam variações sazonais associadas ao nível de poluentes atmosféricos agregados.',
        objective: 'Analisar as taxas de internação hospitalar por asma em relação aos níveis agregados de poluição.',
        correctSystem: 'SIH',
        recommendedKeywords: ['Internações por Asma', 'Ano']
    }
];

const REVIEW_SOURCE_GROUPS = [
    {
        title: 'Fundamentos de epidemiologia e causalidade',
        links: [
            { label: 'OMS — Epidemiologia Básica', description: 'Livro introdutório sobre medidas, delineamentos, causalidade e prevenção.', url: 'https://www.who.int/publications/b/31231' },
            { label: 'CDC — Principles of Epidemiology', description: 'Curso com exercícios sobre medidas epidemiológicas, vigilância e bioestatística.', url: 'https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/index.html' },
            { label: 'CDC — Field Epidemiology Manual', description: 'Capítulos sobre coleta, delineamento, análise e interpretação de dados.', url: 'https://www.cdc.gov/field-epi-manual/php/chapters/index.html' },
            { label: 'Bradford Hill — texto original', description: 'Leitura histórica das nove considerações para discutir causalidade.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC1291382/' },
        ],
    },
    {
        title: 'Dados brasileiros e busca bibliográfica',
        links: [
            { label: 'DATASUS — TABNET', description: 'Morbidade, mortalidade, nascidos vivos, assistência e indicadores de saúde.', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
            { label: 'IBGE — Cidades e Estados', description: 'População e indicadores territoriais, demográficos e socioeconômicos.', url: 'https://www.ibge.gov.br/cidades-e-estados.html' },
            { label: 'DeCS/MeSH — BIREME/OPAS/OMS', description: 'Descritores controlados em português, inglês e espanhol para estruturar buscas.', url: 'https://decs.bvsalud.org/' },
            { label: 'PubMed — guia oficial', description: 'Estratégias, filtros, campos, histórico e busca avançada na base MEDLINE/PubMed.', url: 'https://pubmed.ncbi.nlm.nih.gov/help/' },
        ],
    },
    {
        title: 'Relato, leitura crítica e síntese de evidências',
        links: [
            { label: 'STROBE — EQUATOR Network', description: 'Checklist para relatar estudos observacionais com transparência e completude.', url: 'https://www.equator-network.org/reporting-guidelines/strobe/' },
            { label: 'EQUATOR — biblioteca de diretrizes', description: 'Diretrizes de relato para diferentes desenhos, como CONSORT, PRISMA e STARD.', url: 'https://www.equator-network.org/reporting-guidelines/' },
            { label: 'JBI — ferramentas de avaliação crítica', description: 'Instrumentos para examinar risco de viés em diferentes tipos de estudo.', url: 'https://jbi.global/critical-appraisal-tools' },
            { label: 'Cochrane Handbook', description: 'Referência sobre revisão sistemática, medidas de efeito, viés e síntese.', url: 'https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current' },
            { label: 'CDC — intervalo de confiança', description: 'Explicação aplicada sobre estimativas, erro-padrão e precisão.', url: 'https://archive.cdc.gov/www_cdc_gov/csels/dsepd/ss1978/lesson2/section7.html' },
        ],
    },
    {
        title: 'Ética, manuscrito e escolha de periódico',
        links: [
            { label: 'CNS — Resolução nº 674/2022', description: 'Tipificação e tramitação de protocolos de pesquisa no Sistema CEP/Conep.', url: 'https://www.gov.br/conselho-nacional-de-saude/pt-br/acesso-a-informacao/atos-normativos/resolucoes/2022/resolucao-no-674.pdf/view' },
            { label: 'ICMJE — recomendações', description: 'Autoria, ética, preparo do manuscrito, referências e submissão em revistas médicas.', url: 'https://www.icmje.org/recommendations/' },
            { label: 'CNPq — integridade na pesquisa', description: 'Diretrizes brasileiras sobre autoria, citações, dados, plágio e transparência no uso de IA.', url: 'https://www.gov.br/cnpq/pt-br/composicao/comissao-de-integridade/diretrizes' },
            { label: 'IPEN — prevenção de plágio', description: 'Seleção de códigos e guias brasileiros sobre integridade e respeito aos direitos autorais.', url: 'https://www.gov.br/ipen/pt-br/biblioteca/biblioteca-informa/prevencao-de-plagio' },
            { label: 'DOAJ — transparência editorial', description: 'Princípios para reconhecer periódicos abertos com práticas editoriais transparentes.', url: 'https://doaj.org/apply/transparency/' },
        ],
    },
    {
        title: 'Planejamento e gestão do SUS',
        links: [
            { label: 'Ministério da Saúde — Guia PMS 2026–2029', description: 'Guia prático com análise situacional, SWOT/FOFA, árvore de problemas, GUT, metas e indicadores.', url: 'https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/guias-e-manuais/2025/guia-pratico-de-elaboracao-de-plano-municipal-de-saude-2026-2029.pdf' },
            { label: 'Instrumentos de Planejamento do SUS', description: 'Plano de Saúde, Programação Anual, relatórios quadrimestrais e Relatório Anual de Gestão.', url: 'https://www.gov.br/saude/pt-br/acesso-a-informacao/gestao-do-sus/instrumentos-de-planejamento' },
            { label: 'DigiSUS Gestor — acesso público', description: 'Consulta pública aos instrumentos de planejamento, metas e indicadores de estados e municípios.', url: 'https://digisusgmp.saude.gov.br/' },
            { label: 'DATASUS — Informações de Saúde', description: 'Dados para análise da situação sanitária e apoio à tomada de decisão baseada em evidências.', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
        ],
    },
];

const getAppIcon = (id: AppID) => {
  switch (id) {
    case AppID.GUIDE:
      return <BrainCircuit size={14} className="text-emerald-400"/>;
    case AppID.BROWSER:
      return <Globe size={14} className="text-blue-400"/>;
    case AppID.SHEET:
      return <FileSpreadsheet size={14} className="text-green-400"/>;
    case AppID.WORD:
      return <FileText size={14} className="text-blue-400"/>;
    case AppID.EXPLORER:
      return <Folder size={14} className="text-yellow-400"/>;
    case AppID.SETTINGS:
      return <Settings size={14} className="text-slate-400"/>;
    case AppID.BANNER:
      return <Monitor size={14} className="text-purple-400"/>;
    case AppID.HEALTH_MANAGEMENT:
      return <HeartPulse size={14} className="text-cyan-400"/>;
    default:
      return <Monitor size={14} />;
  }
};

const EducationalPopup = ({ title, content, onClose }: { title: string, content: string, onClose: () => void }) => {
    // Simple bold parser for popups since they only use **bold** syntax
    const renderContent = () => {
        const parts = content.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-blue-800">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="absolute top-4 md:top-20 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[100] bg-white/95 backdrop-blur border-l-4 border-blue-600 text-slate-800 p-4 md:p-6 rounded-r-lg shadow-2xl md:max-w-lg max-h-[82vh] overflow-y-auto animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                    <Lightbulb size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-2 text-blue-900">{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{renderContent()}</p>
                    <button onClick={onClose} className="mt-4 text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">Entendi, continuar</button>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<Record<AppID, WindowState>>(DEFAULT_WINDOWS);
  const [activeAppId, setActiveAppId] = useState<AppID | null>(AppID.GUIDE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [inputUser, setInputUser] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Game State
  const [xp, setXp] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({ badSearchQueries: 0, wrongDesignChoices: 0, picoRetries: 0, articlesRead: 0, quizMistakes: 0, predatorySubmission: false, managementMistakes: 0, integrityMistakes: 0 });
  const [currentStep, setCurrentStep] = useState<EcologicalStep>(EcologicalStep.SCENARIO_SELECTION);
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);
  const [fileSystem, setFileSystem] = useState<VirtualFile[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [popup, setPopup] = useState<{title: string, content: string} | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [explorerStartPath, setExplorerStartPath] = useState<'root'|'trash'>('root');
  const [showMissionWidget, setShowMissionWidget] = useState(false);
  const [savedReferences, setSavedReferences] = useState<ArticleHit[]>([]);
  const [fileToOpen, setFileToOpen] = useState<VirtualFile | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [bannerCompleted, setBannerCompleted] = useState(false);
  const [showFinishPrompt, setShowFinishPrompt] = useState(false);
  const [showRestartPrompt, setShowRestartPrompt] = useState(false);

  // Phase 1 State
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [designFeedback, setDesignFeedback] = useState<{correct: boolean, msg: string} | null>(null);

  // PICO Form State
  const [picoP, setPicoP] = useState('');
  const [picoI, setPicoI] = useState('');
  const [picoC, setPicoC] = useState('');
  const [picoO, setPicoO] = useState('');
  const [picoLoading, setPicoLoading] = useState(false);
  const [picoFeedback, setPicoFeedback] = useState('');
  const [showPicoTutorial, setShowPicoTutorial] = useState(false);

  const triggerFullScreen = () => {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
          elem.requestFullscreen().catch(err => {
              console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
          });
      }
  };

  const handleLogin = () => {
    if (inputUser.trim().length > 0) {
      // The Gemini key stays only on the server (Render environment variable).
      setApiKey('');
      setIsLoggedIn(true);
      setShowOnboarding(true);
      setLoginError('');
      triggerFullScreen();
    } else {
      setLoginError('Preencha seu nome para acessar o ambiente virtual.');
    }
  };

  const handleOfflineLogin = () => {
      setApiKey("OFFLINE_MODE_KEY_12345"); 
      setInputUser(inputUser || "Aluno Convidado");
      setLoginError('');
      setIsLoggedIn(true);
      setShowOnboarding(true);
      triggerFullScreen();
      
      setTimeout(() => {
          setPopup({
              title: "Modo Offline Ativado",
              content: "Você entrou no modo de simulação sem internet/IA. O DATASUS e o PubMed usarão bancos de dados locais pré-gravados. Bom aprendizado!"
          });
      }, 1000);
  };

  const updateStats = (key: keyof GameStats, value?: any) => {
      setGameStats(prev => {
          if (typeof prev[key] === 'number') {
              return {...prev, [key]: (prev[key] as number) + 1};
          }
          return {...prev, [key]: value};
      });
  };

  const handleScenarioSelect = (scenario: Scenario) => {
      setCurrentScenario(scenario);
      setCurrentStep(EcologicalStep.STUDY_DESIGN_CHOICE);
  };

  const confirmDesignChoice = () => {
      if (!selectedDesign) return;
      
      if (selectedDesign === 'ecologico') {
          setDesignFeedback({
              correct: true,
              msg: "Correto! Estudos Ecológicos utilizam dados agregados (populacionais) e secundários, ideais para este cenário."
          });
          setTimeout(() => {
              setCurrentStep(EcologicalStep.PICO_FORMULATION);
              setXp(prev => prev + 50);
              setDesignFeedback(null);
              setSelectedDesign(null);
              setPopup({
                  title: "Excelente escolha!",
                  content: "Você identificou corretamente o desenho. Agora precisamos estruturar a pergunta de pesquisa."
              });
          }, 2500);
      } else {
          const msg = selectedDesign === 'coorte' 
            ? "Incorreto. Uma Coorte exige acompanhar indivíduos ao longo do tempo. Aqui temos apenas dados consolidados por região."
            : "Incorreto. Ensaio Clínico envolve testar uma intervenção (remédio/terapia) em pacientes. Nós apenas observaremos dados existentes.";
          setDesignFeedback({ correct: false, msg });
          updateStats('wrongDesignChoices');
      }
  };

  const handlePICOSubmit = async () => {
      if(!currentScenario) return;
      setPicoLoading(true);
      const result = await validatePICO(picoP, picoI, picoC, picoO, currentScenario);
      setPicoLoading(false);
      
      if (result.isCorrect) {
          setPicoFeedback('');
          setCurrentStep(EcologicalStep.DATA_COLLECTION);
          setXp(prev => prev + 100);
          setShowMissionWidget(true);
          setPopup({
              title: "Estratégia PECO Aprovada!",
              content: `Ótimo! ${result.feedback || "Sua pergunta condiz com o tema e o desenho ecológico."} Agora você deve coletar os dados. Abra o Piggle Chrome e acesse o DATASUS. Atenção ao sistema correto (SIM vs SINAN).`
          });
      } else {
          setPicoFeedback(result.feedback);
          updateStats('picoRetries');
      }
  };

  const handleSaveFile = (file: VirtualFile) => {
    setFileSystem(prev => [...prev, file]);
    
    if (currentStep === EcologicalStep.DATA_COLLECTION && file.type === 'csv') {
        setCurrentStep(EcologicalStep.ANALYSIS);
        setPopup({
            title: "Download Concluído",
            content: "O arquivo .CSV foi salvo na pasta 'Downloads'. Agora abra o aplicativo 'Pigxcel' e use o botão 'Abrir Arquivo' para processar esses dados."
        });
        setXp(prev => prev + 100);
    }

    if (file.type === 'doc') {
        setCurrentStep(EcologicalStep.SUBMISSION);
        setPopup({
            title: "Manuscrito Salvo!",
            content: "Parabéns! Seu artigo foi salvo na pasta 'Documentos' e a Meta 5 foi concluída.\n\nAgora abra o **Piggle Chrome**, acesse o **Pigmail** e envie o manuscrito ao orientador. Depois do envio, aguarde: a resposta chegará como um novo e-mail na caixa de entrada."
        });
    }
  };

  const handleDeleteFile = (id: string) => {
      setFileSystem(prev => prev.map(f => f.id === id ? {...f, folder: 'trash'} : f));
  };

  const handleRestoreFile = (id: string) => {
      setFileSystem(prev => prev.map(f => f.id === id ? {...f, folder: f.type === 'doc' ? 'documents' : 'downloads'} : f));
  };

  const handleOpenFileFromExplorer = (file: VirtualFile) => {
      if (file.type === 'csv') {
          setFileToOpen(file);
          toggleWindow(AppID.SHEET);
      } else if (file.type === 'doc') {
          setFileToOpen(file);
          toggleWindow(AppID.WORD);
      }
  };

  const handleSaveReference = (article: ArticleHit) => {
      if (!savedReferences.some(r => r.id === article.id)) {
          setSavedReferences(prev => [...prev, { ...article, cited: true }]);
          setXp(prev => prev + 20); 
          updateStats('articlesRead');
      }
  };

  const handleCopySuccess = (type: 'chart' | 'table') => {
      if (currentStep === EcologicalStep.ANALYSIS) {
           setCurrentStep(EcologicalStep.WRITING);
           setPopup({
               title: "Dados Copiados!",
               content: `Você copiou ${type === 'chart' ? 'o Gráfico' : 'a Tabela'} com sucesso. O próximo passo lógico é abrir o **Pigword**, escrever seus resultados e usar o botão "Colar".`
           });
      }
  };

  const handleEmailSend = (attachmentId: string | null) => {
      if (attachmentId === 'OPEN_BANNER') {
          setCurrentStep(EcologicalStep.BANNER_CREATION);
          setPopup({
              title: "Parecer aprovado",
              content: "O orientador aprovou o manuscrito. Agora abra o **Banner Designer Pro** e monte todas as seções do pôster científico antes de finalizar."
          });
          toggleWindow(AppID.BANNER);
          return;
      }

      if (attachmentId === 'BANNER_FINISHED') {
          setBannerCompleted(true);
          handleSaveFile({
              id: `banner-${Date.now()}`,
              name: 'Banner_Cientifico_Final.poster',
              type: 'poster',
              folder: 'documents',
              content: { status: 'finalizado', scenario: currentScenario?.title },
              createdAt: new Date()
          });
          setCurrentStep(EcologicalStep.JOURNAL_SUBMISSION);
          setPopup({
              title: "Banner finalizado e salvo!",
              content: "Seu banner foi salvo em **Meus Arquivos > Documentos**. Agora abra o **Piggle Chrome** e use o **Portal de Periódicos** para escolher uma revista adequada ao escopo do estudo."
          });
          closeWindow(AppID.BANNER);
          return;
      }

      setCurrentStep(EcologicalStep.AWAITING_REVIEW);
      setXp(prev => prev + 200);
      setPopup({
          title: "E-mail enviado ao orientador",
          content: "Envio confirmado. O parecer não é instantâneo: aguarde alguns segundos e acompanhe a caixa de entrada do **Pigmail**. Um aviso aparecerá quando a resposta chegar."
      });
      
      // Increased delay to 15 seconds
      setTimeout(() => {
          const newEmail: Email = {
              id: Date.now().toString(),
              from: 'Orientador PIG IV',
              subject: 'Parecer Final: Artigo Aprovado',
              body: `Olá ${inputUser}, analisei seu manuscrito. A metodologia ecológica foi bem aplicada e os dados do DATASUS sustentam a discussão. Gostei do embasamento bibliográfico. Como próximo passo, clique no botão abaixo para iniciar a criação do seu Banner para o congresso.`,
              read: false,
              date: new Date(),
              hasAction: true,
              actionLabel: "Criar Banner"
          };
          setEmails(prev => [newEmail, ...prev]);
          setPopup({
              title: "Você tem um novo e-mail!",
              content: "O orientador respondeu sua submissão. Abra o **Pigmail** no Piggle Chrome para ler o parecer e liberar a próxima etapa."
          });
      }, 15000); // 15s Delay
  };

  // Final Game Over Handler
  const handleJournalSubmissionSuccess = () => {
      setCurrentStep(EcologicalStep.CONGRESS_SUBMISSION);
  }

  const handleCongressSuccess = () => {
      setCurrentStep(EcologicalStep.LATTES_REGISTRATION);
  }

  // Handle Lattes success
  const handleLattesSuccess = () => {
      setCurrentStep(EcologicalStep.HEALTH_MANAGEMENT);
      setXp(prev => prev + 100);
      setWindows(previous => {
          const maximumZ = Math.max(...(Object.values(previous) as WindowState[]).map(windowState => windowState.zIndex));
          return { ...previous, [AppID.HEALTH_MANAGEMENT]: { ...previous[AppID.HEALTH_MANAGEMENT], isOpen: true, isMinimized: false, zIndex: maximumZ + 1 } };
      });
      setActiveAppId(AppID.HEALTH_MANAGEMENT);
      setShowMissionWidget(false);
      setPopup({
          title: 'Nova missão: da pesquisa à gestão do SUS',
          content: 'Seu portfólio científico está completo, mas a jornada ainda não terminou. A Secretaria Municipal de Saúde quer transformar os achados do estudo em um plano de ação. A **Sala de Situação SUS** foi aberta para a missão final.'
      });
  }

  const handleHealthManagementComplete = (score: number) => {
      setFileSystem(previous => previous.some(file => file.id === 'produto-tecnico-sus') ? previous : [...previous, {
          id: 'produto-tecnico-sus',
          name: 'Nota_Tecnica_Plano_Municipal_Saude.doc',
          type: 'doc',
          folder: 'documents',
          content: { text: `PRODUTO TÉCNICO — SALA DE SITUAÇÃO SUS\n\nCenário: ${currentScenario?.title || 'Estudo epidemiológico'}\nDesempenho na missão de gestão: ${score}%.\n\nO produto integra diagnóstico situacional, indicador, análise SWOT/FOFA, Ishikawa, priorização GUT, intervenção, meta SMART e monitoramento.` },
          createdAt: new Date()
      }]);
      setCurrentStep(EcologicalStep.COMPLETED);
      setXp(prev => prev + 300);
      closeWindow(AppID.HEALTH_MANAGEMENT);
      setShowFinishPrompt(true);
  };

  // Calculate Skill Scores
  const calculateSkills = () => {
      const methodScore = Math.max(0, 100 - (gameStats.wrongDesignChoices * 30) - (gameStats.picoRetries * 15));
      const ethicsScore = Math.max(0, 100 - (gameStats.predatorySubmission ? 50 : 0));
      const statsScore = Math.max(0, 100 - (gameStats.quizMistakes * 20));
      const managementScore = Math.max(60, 100 - ((gameStats.managementMistakes || 0) * 5));
      return { methodScore, ethicsScore, statsScore, managementScore };
  }

  const buildPersonalizedDebrief = () => {
      const strengths: string[] = [];
      const reviewPoints: string[] = [];
      const reviewPlan: string[] = [];

      if (gameStats.wrongDesignChoices === 0) {
          strengths.push('Você reconheceu de primeira que dados agregados por local e período pedem um desenho ecológico.');
      } else {
          reviewPoints.push(`Você precisou de ${gameStats.wrongDesignChoices} nova(s) tentativa(s) para escolher o desenho. Revise unidade de análise, dados agregados e falácia ecológica.`);
          reviewPlan.push('Compare estudo ecológico, transversal, caso-controle e coorte, identificando a unidade de análise de cada um.');
      }

      if (gameStats.picoRetries === 0) {
          strengths.push('Sua pergunta PECO ficou coerente na primeira validação, com população, exposição, comparação e desfecho alinhados.');
      } else {
          reviewPoints.push(`A pergunta PECO exigiu ${gameStats.picoRetries} revisão(ões). Reforce a função de P, E, C e O e mantenha todos os elementos no nível populacional.`);
          reviewPlan.push('Reescreva a pergunta do dossiê marcando explicitamente P (População), E (Exposição), C (Comparação) e O (Outcome/Desfecho).');
      }

      if (gameStats.badSearchQueries === 0) {
          strengths.push('Você construiu buscas bibliográficas focadas, sem registrar consultas inadequadas.');
      } else {
          reviewPoints.push(`Foram registradas ${gameStats.badSearchQueries} busca(s) pouco específica(s). Revise descritores, sinônimos e os operadores AND/OR.`);
          reviewPlan.push('Monte uma estratégia em blocos: sinônimos unidos por OR e conceitos diferentes unidos por AND.');
      }

      if (gameStats.quizMistakes === 0) {
          strengths.push('Você respondeu aos testes de bioestatística sem erros registrados.');
      } else {
          reviewPoints.push(`Você cometeu ${gameStats.quizMistakes} erro(s) nos testes. Retome correlação, valor de p, intervalo de confiança e interpretação sem linguagem causal.`);
          reviewPlan.push('Refaça os exemplos do livro sobre Pearson, valor de p e intervalo de confiança, explicando cada resultado em uma frase.');
      }

      if (!gameStats.predatorySubmission) {
          strengths.push('Você conduziu a escolha do periódico sem avançar por uma opção predatória.');
      } else {
          reviewPoints.push('Você chegou a considerar uma revista predatória. Verifique transparência editorial, revisão por pares, indexação e taxas antes de submeter.');
          reviewPlan.push('Use a lista de sinais de alerta do livro para comparar um periódico confiável com um periódico predatório.');
      }

      if (savedReferences.length >= 2) {
          strengths.push(`Você reuniu ${savedReferences.length} referências e construiu uma base bibliográfica para o manuscrito.`);
      } else {
          reviewPoints.push('Sua base bibliográfica ficou pequena. Uma discussão científica precisa dialogar com estudos relevantes e atuais.');
          reviewPlan.push('Amplie a busca e selecione referências que sustentem a introdução, o método e a comparação dos resultados.');
      }

      if (fileSystem.some(file => file.type === 'doc')) {
          strengths.push('Você concluiu e salvou o manuscrito, transformando análise em comunicação científica estruturada.');
      }

      if (bannerCompleted) {
          strengths.push('Você também sintetizou o estudo em um banner científico completo.');
      }

      if ((gameStats.managementMistakes || 0) === 0 && currentStep >= EcologicalStep.COMPLETED) {
          strengths.push('Na Sala de Situação SUS, você conectou indicador, causas, prioridade, orçamento, meta e monitoramento sem erros registrados.');
      } else if ((gameStats.managementMistakes || 0) > 0) {
          reviewPoints.push(`Na missão de gestão, foram necessárias ${gameStats.managementMistakes} revisão(ões) de decisão. Retome SWOT/FOFA, Ishikawa, GUT e a formulação de metas SMART.`);
          reviewPlan.push('Refaça a cadeia: problema → causas → prioridade → ação → indicador → meta → monitoramento.');
      }

      if (strengths.length === 0) {
          strengths.push('Você percorreu todas as etapas e concluiu o ciclo da pesquisa, da pergunta à divulgação científica.');
      }

      if (reviewPlan.length === 0) {
          reviewPlan.push('Avance para temas de maior complexidade: confundimento, viés, falácia ecológica e limites da inferência causal.');
          reviewPlan.push('Releia os nove aspectos de Bradford Hill como apoio ao raciocínio causal, sem tratá-los como uma lista de prova de causalidade.');
      }

      reviewPlan.push('Ao interpretar o seu estudo, diferencie associação estatística, relevância epidemiológica e causalidade.');

      return { strengths, reviewPoints, reviewPlan };
  };

  // Dynamic desktop shortcut indicator to guide user next steps
  const getShortcutGlow = (id: AppID) => {
    if (currentStep === EcologicalStep.DATA_COLLECTION && id === AppID.BROWSER) {
      return 'ring-4 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse scale-105';
    }
    if (currentStep === EcologicalStep.ANALYSIS && id === AppID.SHEET) {
      return 'ring-4 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse scale-105';
    }
    if (currentStep === EcologicalStep.WRITING && id === AppID.WORD) {
      return 'ring-4 ring-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse scale-105';
    }
    if (currentStep === EcologicalStep.HEALTH_MANAGEMENT && id === AppID.HEALTH_MANAGEMENT) {
      return 'ring-4 ring-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.85)] animate-pulse scale-105';
    }
    return '';
  };

  const toggleWindow = (id: AppID, startPath?: 'root' | 'trash') => {
      if (id === AppID.BANNER && currentStep < EcologicalStep.BANNER_CREATION && !emails.some(e => e.hasAction)) {
          setPopup({ title: 'Aplicativo ainda bloqueado', content: 'Envie o manuscrito ao orientador pelo **Pigmail** e aguarde o parecer antes de iniciar o banner.' });
          return;
      }
      if (id === AppID.HEALTH_MANAGEMENT && currentStep < EcologicalStep.HEALTH_MANAGEMENT) {
          setPopup({ title: 'Sala de Situação ainda bloqueada', content: 'Conclua a pesquisa, publique o trabalho e finalize o portfólio no **Currículo Lattes**. Depois, a Secretaria Municipal enviará a missão de gestão.' });
          return;
      }
      
      if (id === AppID.EXPLORER && startPath) {
          setExplorerStartPath(startPath);
      } else if (id === AppID.EXPLORER) {
          setExplorerStartPath('root');
      }

      setWindows(prev => {
          const win = prev[id];
          const allWindows = Object.values(prev) as WindowState[];
          const maxZ = Math.max(...allWindows.map(w => w.zIndex));

          if (win.isOpen && !win.isMinimized && activeAppId === id) {
              return { ...prev, [id]: { ...win, isMinimized: true } };
          }
          
          if (win.isOpen) {
              setActiveAppId(id);
              return { ...prev, [id]: { ...win, isMinimized: false, zIndex: maxZ + 1 } };
          }

          setActiveAppId(id);
          return { ...prev, [id]: { ...win, isOpen: true, isMinimized: false, zIndex: maxZ + 1 } };
      });
      setMenuOpen(false);
  };
  
  const closeWindow = (id: AppID) => setWindows(prev => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));
  const focusWindow = (id: AppID) => {
      setActiveAppId(id);
      setWindows(prev => {
           const maxZ = Math.max(...(Object.values(prev) as WindowState[]).map(w => w.zIndex));
           return { ...prev, [id]: { ...prev[id], zIndex: maxZ + 1 } };
      });
  };

  const handleRestart = () => {
      setShowRestartPrompt(true);
  };

  const handlePrintCertificate = () => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
          const content = document.getElementById('certificate-container')?.innerHTML || '';
          printWindow.document.write(`
              <html>
              <head>
                  <title>Certificado de Conclusão - ${inputUser}</title>
                  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                  <style>
                      @page {
                          size: A4 landscape;
                          margin: 0;
                      }
                      body {
                          font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
                          background: white;
                          padding: 40px;
                          margin: 0;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          height: 100vh;
                      }
                      #no-print { display: none !important; }
                  </style>
              </head>
              <body onload="setTimeout(function() { window.print(); window.close(); }, 500)">
                  <div class="w-full h-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center border-[16px] border-double border-blue-900 p-12 relative bg-white shadow-inner" style="border-color: #1e3a8a;">
                      ${content}
                  </div>
              </body>
              </html>
          `);
          printWindow.document.close();
      } else {
          window.print();
      }
  };

  const { methodScore, ethicsScore, statsScore, managementScore } = calculateSkills();
  const finalDebrief = buildPersonalizedDebrief();

  // --- Render ---

  if (!isLoggedIn) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center relative overflow-hidden p-4">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072')] bg-cover opacity-40"></div>
         <div className="z-10 bg-white/10 p-5 md:p-8 rounded-3xl backdrop-blur-xl border border-white/20 text-center shadow-2xl animate-in zoom-in duration-500 max-w-md w-full">
             <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center shadow-inner border-4 border-white/10">
                 <User size={40} className="text-slate-500" />
             </div>
             <h1 className="text-xl font-bold text-white mb-1 leading-tight">Simulador de Estudos Epidemiológicos</h1>
             <p className="text-blue-200 font-light text-xs">Ambiente Virtual de Aprendizado</p>
             <p className="text-slate-300 font-medium text-[10px] mt-1.5 mb-6">Feito por Thales Báccaro, Leonardo Sartori e Theo Báccaro</p>
             
             <div className="space-y-4 relative group text-left">
                 <div className="relative">
                    <label className="absolute -top-2.5 left-3 bg-slate-900 text-blue-400 text-[9px] px-2 rounded uppercase font-bold tracking-wider">Nome Completo</label>
                    <input 
                        className="w-full px-4 py-2.5 rounded-lg bg-black/30 text-white placeholder-white/30 outline-none border border-white/10 focus:border-white/50 focus:bg-black/50 transition-all text-sm"
                        placeholder="Ex: João Silva"
                        value={inputUser}
                        onChange={e => { setInputUser(e.target.value); if (loginError) setLoginError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                     />
                  </div>
                  {loginError && <p role="alert" className="-mt-2 text-xs font-medium text-red-300">{loginError}</p>}

                 <button 
                     onClick={handleLogin} 
                     className="relative overflow-hidden w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 border border-white/20 cursor-pointer group animate-pulse hover:animate-none"
                 >
                     <span>Acessar Ambiente Virtual</span>
                     <PlayCircle size={18} className="text-blue-200 group-hover:text-white transition-colors group-hover:translate-x-0.5 transition-transform"/>
                 </button>

                 <div className="pt-3 border-t border-white/10 text-center">
                     <button 
                        onClick={handleOfflineLogin} 
                        className="text-[10px] text-slate-400 hover:text-white flex items-center justify-center gap-1 w-full transition-colors"
                     >
                          <WifiOff size={10}/> Entrar em Modo Offline (sem IA)
                     </button>
                 </div>
             </div>
         </div>
      </div>
    );
  }

  if (isGameOver) {
      return (
          <>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #certificate-container, #certificate-container * { visibility: visible; }
                    #certificate-container { 
                        position: absolute; 
                        left: 0; top: 0; 
                        width: 100%; height: 100%; 
                        border: 5px solid #1e3a8a; 
                        margin: 0; padding: 0;
                        box-sizing: border-box;
                    }
                    #no-print { display: none !important; }
                }
            `}</style>

            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-3 md:p-8 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072')] bg-cover overflow-auto">
                <div className="bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl w-full max-w-6xl min-h-[90vh] md:h-[90vh] border border-white/20 p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 animate-in zoom-in duration-700">
                    
                    {/* Report Side */}
                    <div id="no-print" className="w-full md:w-1/3 md:border-r border-slate-200 md:pr-8 flex flex-col min-h-[420px]">
                        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2"><BrainCircuit className="text-blue-600"/> Boletim de Habilidades</h2>
                        <div className="space-y-6 flex-1 overflow-auto pr-2">
                            {/* Skill Bars */}
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1 text-slate-600">
                                        <span className="flex items-center gap-1"><Microscope size={14}/> Metodologia</span>
                                        <span>{methodScore}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${methodScore > 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${methodScore}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1 text-slate-600">
                                        <span className="flex items-center gap-1"><Scale size={14}/> Ética em Pesquisa</span>
                                        <span>{ethicsScore}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${ethicsScore > 80 ? 'bg-blue-500' : 'bg-red-500'}`} style={{width: `${ethicsScore}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1 text-slate-600">
                                        <span className="flex items-center gap-1"><BarChart2 size={14}/> Bioestatística</span>
                                        <span>{statsScore}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${statsScore > 80 ? 'bg-purple-500' : 'bg-orange-500'}`} style={{width: `${statsScore}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1 text-slate-600">
                                        <span className="flex items-center gap-1"><HeartPulse size={14}/> Gestão em Saúde</span>
                                        <span>{managementScore}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${managementScore > 80 ? 'bg-cyan-500' : 'bg-amber-500'}`} style={{width: `${managementScore}%`}}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3" aria-label="Debriefing personalizado da partida">
                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-2"><CheckCircle size={14}/> Decisões bem executadas</h3>
                                    <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                                        {finalDebrief.strengths.map((item, index) => (
                                            <li key={`strength-${index}`} className="flex items-start gap-2"><span className="text-emerald-600 font-bold">✓</span><span>{item}</span></li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-2"><AlertTriangle size={14}/> O que revisar</h3>
                                    {finalDebrief.reviewPoints.length > 0 ? (
                                        <ul className="space-y-2 text-xs leading-relaxed text-slate-700">
                                            {finalDebrief.reviewPoints.map((item, index) => (
                                                <li key={`review-${index}`} className="flex items-start gap-2"><span className="text-amber-600 font-bold">!</span><span>{item}</span></li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-xs leading-relaxed text-slate-700">Nenhum erro crítico foi registrado. Seu próximo passo é aprofundar as limitações e evitar interpretações causais indevidas.</p>
                                    )}
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-blue-800 mb-2 flex items-center gap-2"><Lightbulb size={14}/> Plano de revisão recomendado</h3>
                                    <ol className="space-y-2 text-xs leading-relaxed text-slate-700">
                                        {finalDebrief.reviewPlan.map((item, index) => (
                                            <li key={`plan-${index}`} className="flex items-start gap-2"><span className="text-blue-700 font-bold">{index + 1}.</span><span>{item}</span></li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowReviewModal(true)} className="mt-4 w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700 shadow flex items-center justify-center gap-2">
                            <BookOpen size={16}/> Livro de Revisão Teórica
                        </button>
                    </div>

                    {/* Certificate Side */}
                    <div id="certificate-container" className="flex-1 flex flex-col items-center justify-center border-[10px] md:border-[16px] border-double border-blue-900 p-5 md:p-10 relative bg-white shadow-inner min-h-[620px]">
                        <div id="no-print" className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-900 text-white px-6 py-2 rounded-full font-serif font-bold tracking-widest shadow-lg">
                            CERTIFICADO DE CONCLUSÃO
                        </div>
                        <Award size={100} className="text-yellow-500 mb-6 drop-shadow-md"/>
                        <h1 className="text-3xl md:text-5xl font-serif text-slate-900 font-bold mb-4 text-center">Parabéns, {inputUser}!</h1>
                        <p className="text-slate-600 text-xl text-center mb-8 max-w-md">
                            Certificamos que o aluno completou com êxito o módulo prático de:
                        </p>
                        <h2 className="text-2xl md:text-4xl font-bold text-blue-900 mb-8 border-y-2 border-slate-200 py-6 text-center">Estudos Ecológicos, Dados Secundários & Gestão em Saúde</h2>
                        <div className="flex gap-8 mt-auto w-full justify-center">
                           <div className="text-center">
                               <div className="h-px w-40 bg-black mb-2"></div>
                               <div className="text-xs font-serif">Coordenador (a) do módulo</div>
                           </div>
                        </div>
                        
                        <div id="no-print" className="absolute top-3 right-3 md:top-12 md:right-12 flex flex-col items-center gap-2 animate-pulse">
                             <button onClick={handlePrintCertificate} className="bg-green-600 text-white px-4 py-2 rounded font-bold shadow-lg flex items-center gap-2 hover:bg-green-700 transition-all">
                                <Printer size={18}/> Baixar PDF
                             </button>
                        </div>
                        <div className="absolute top-4 left-4 text-[8px] md:text-[9px] leading-relaxed text-slate-400" style={{maxWidth: '48%'}}>
                            Desenvolvido por Thales Báccaro, Leonardo Sartori e Theo Báccaro
                        </div>
                        <div className="absolute bottom-4 right-4 text-[10px] text-slate-400">Simulador de Epidemiologia</div>
                    </div>
                </div>

                {/* Restart Button */}
                <button id="no-print" onClick={handleRestart} className="fixed bottom-4 right-4 md:bottom-8 md:right-8 bg-blue-600 text-white px-4 md:px-6 py-3 rounded-full font-bold hover:bg-blue-700 shadow-xl flex items-center gap-2 z-50">
                   <RotateCcw size={18}/> Reiniciar Simulação
                </button>
                <button id="no-print" onClick={() => setIsGameOver(false)} className="fixed bottom-4 left-4 md:bottom-8 md:left-8 bg-slate-800 text-white px-4 md:px-6 py-3 rounded-full font-bold hover:bg-slate-700 shadow-xl z-50">
                   Continuar explorando
                </button>

                {showRestartPrompt && (
                    <div id="no-print" className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                        <div role="alertdialog" aria-modal="true" aria-labelledby="restart-title" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700"><RotateCcw size={24}/></div>
                            <h3 id="restart-title" className="text-xl font-bold text-slate-900">Reiniciar a simulação?</h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">Todo o progresso desta partida será apagado e você voltará à tela inicial.</p>
                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button onClick={() => setShowRestartPrompt(false)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Cancelar</button>
                                <button onClick={() => window.location.reload()} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">Apagar e reiniciar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Review Modal */}
                {showReviewModal && (
                  <div id="no-print" className="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                      <div className="bg-white rounded-xl max-w-4xl w-full h-[88vh] overflow-y-auto p-4 md:p-8 animate-in zoom-in">
                           <div className="flex justify-between items-center mb-6 border-b pb-4">
                               <h2 className="text-xl md:text-2xl font-bold text-blue-900 flex items-center gap-2"><BookOpen/> Livro de Revisão PIG</h2>
                               <button onClick={() => setShowReviewModal(false)}><XCircle size={24} className="text-slate-400 hover:text-red-500"/></button>
                           </div>
                           
                           <div className="space-y-8">
                               <section>
                                   <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-blue-500 pl-2">1. Incidência vs. Prevalência</h3>
                                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
                                       <div>
                                           <strong>Incidência (Casos Novos)</strong>
                                           <p>Mede o risco de adoecer. Usada em epidemias (Dengue) e doenças agudas.</p>
                                       </div>
                                       <div>
                                           <strong>Prevalência (Casos Existentes)</strong>
                                           <p>Mede a carga da doença. Usada em doenças crônicas (Diabetes, Hipertensão).</p>
                                       </div>
                                   </div>
                               </section>

                               <section>
                                   <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-green-500 pl-2">2. Critérios de Bradford Hill (Causalidade)</h3>
                                   <p className="text-sm text-slate-600 mb-2">As considerações de Hill ajudam a discutir uma hipótese causal, mas não são uma lista automática de comprovação. Temporalidade é indispensável; o conjunto de evidências e o desenho do estudo importam.</p>
                                   <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                                       <li className="rounded-lg bg-slate-50 p-3"><strong>1. Força da associação:</strong> associações grandes podem ser menos explicáveis por alguns vieses, mas uma associação forte, sozinha, não demonstra causa.</li>
                                       <li className="rounded-lg bg-slate-50 p-3"><strong>2. Consistência:</strong> resultados semelhantes em populações, locais, épocas e métodos diferentes fortalecem a interpretação.</li>
                                       <li className="rounded-lg bg-slate-50 p-3"><strong>3. Especificidade:</strong> uma exposição ligada a um desfecho específico pode apoiar a hipótese, embora muitas doenças sejam multicausais.</li>
                                       <li className="rounded-lg border border-green-200 bg-green-50 p-3"><strong>4. Temporalidade — indispensável:</strong> a exposição precisa ocorrer antes do desfecho. É a única consideração obrigatória para causalidade.</li>
                                       <li className="rounded-lg bg-slate-50 p-3"><strong>5. Gradiente biológico:</strong> mudanças no nível de exposição acompanhadas por mudanças no desfecho podem sugerir dose–resposta; nem toda relação causal é linear.</li>
                                       <li className="rounded-lg bg-slate-50 p-3"><strong>6. Plausibilidade:</strong> a relação deve ser compatível com conhecimentos biológicos, clínicos ou sociais disponíveis, que podem evoluir.</li>
                                       <li className="rounded-lg bg-slate-50 p-3"><strong>7. Coerência:</strong> a interpretação não deve contradizer, sem boa explicação, a história natural da doença e o conjunto de evidências.</li>
                                       <li className="rounded-lg bg-slate-50 p-3"><strong>8. Experimento:</strong> reduzir ou remover a exposição e observar mudança no desfecho pode apoiar causalidade quando a experimentação é possível e ética.</li>
                                       <li className="rounded-lg bg-slate-50 p-3 md:col-span-2"><strong>9. Analogia:</strong> relações causais semelhantes já conhecidas podem tornar a hipótese mais plausível, mas oferecem apoio fraco quando usadas isoladamente.</li>
                                   </ol>
                                   <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><strong>Como usar:</strong> avalie explicações alternativas, vieses, confundimento, precisão e desenho do estudo. As nove considerações orientam o raciocínio; não funcionam como pontuação ou checklist capaz de “provar” causalidade.</p>
                               </section>

                               <section>
                                   <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-purple-500 pl-2">3. Variáveis</h3>
                                   <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                                       <li><strong>Quantitativas (Numéricas):</strong> Contínuas (Peso, Altura) ou Discretas (Nº de filhos).</li>
                                       <li><strong>Qualitativas (Categóricas):</strong> Nominais (Cor dos olhos, Sexo) ou Ordinais (Escolaridade, Estadiamento).</li>
                                       <li><strong>No gráfico:</strong> O eixo X costuma representar a variável explicativa, exposição ou tempo; isso não a transforma automaticamente em causa. O eixo Y representa o desfecho ou resposta.</li>
                                   </ul>
                               </section>

                                <section>
                                   <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-red-500 pl-2">4. Falácia Ecológica</h3>
                                   <p className="text-sm text-slate-600 leading-relaxed">
                                       É o erro de inferir que uma correlação encontrada no nível do grupo (população) se aplica necessariamente a cada indivíduo desse grupo.
                                       <br/><em>Exemplo: Se países com maior consumo de chocolate têm mais prêmios Nobel, não significa que comer chocolate te fará ganhar um Nobel. Pode ser que países ricos comam mais chocolate E invistam mais em ciência (Fator de Confusão: Renda).</em>
                                   </p>
                                </section>

                                <section>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-cyan-500 pl-2">5. PECO e estudo ecológico</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                                        <div className="rounded-lg bg-slate-50 p-3"><strong>P — População</strong><p>Quais municípios, regiões ou períodos serão estudados?</p></div>
                                        <div className="rounded-lg bg-slate-50 p-3"><strong>E — Exposição</strong><p>Qual característica agregada, política, indicador ou período será comparado?</p></div>
                                        <div className="rounded-lg bg-slate-50 p-3"><strong>C — Comparador</strong><p>Qual grupo, território, categoria ou período de referência?</p></div>
                                        <div className="rounded-lg bg-slate-50 p-3"><strong>O — Outcome (desfecho)</strong><p>Qual evento ou indicador de saúde será medido?</p></div>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">No estudo ecológico, exposição e desfecho são medidos para grupos. É eficiente para tendências, comparações territoriais e geração de hipóteses, porém tem controle limitado de confundimento individual e não permite transportar automaticamente o achado para uma pessoa.</p>
                                </section>

                                <section>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-emerald-500 pl-2">6. DATASUS: fonte, numerador e denominador</h3>
                                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                                        <li><strong>SIM:</strong> mortalidade; <strong>SINASC:</strong> nascidos vivos; <strong>SINAN:</strong> agravos de notificação; <strong>SIH/SUS:</strong> internações financiadas pelo SUS.</li>
                                        <li>Conte eventos no numerador e use uma população sob risco coerente no denominador. Informe multiplicador (por 1.000, 10.000 ou 100.000).</li>
                                        <li>Confira definição de caso, local de residência/ocorrência, período, cobertura, duplicidades e mudanças de codificação.</li>
                                        <li>Dados secundários podem ter atraso, subnotificação, erro de preenchimento e diferenças de cobertura. “Zero” pode significar ausência de registro, não ausência de doença.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-yellow-500 pl-2">7. Pearson, Spearman, p-valor e IC95%</h3>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <p><strong>Pearson (r):</strong> resume direção e intensidade de uma relação linear entre variáveis quantitativas, de −1 a +1. É sensível a valores extremos e não prova causalidade.</p>
                                        <p><strong>Spearman (ρ):</strong> calcula a associação pelos postos; é útil para relações monotônicas, dados ordinais ou quando pressupostos do Pearson não são razoáveis.</p>
                                        <p><strong>p-valor:</strong> mede quão incompatíveis os dados são com a hipótese nula, sob o modelo adotado. Não é a probabilidade de a hipótese ser verdadeira e não mede importância clínica.</p>
                                        <p><strong>IC95%:</strong> mostra a precisão e a faixa de valores compatíveis com os dados e o método. Para correlação, o valor nulo é 0; para RR e OR, é 1.</p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-orange-500 pl-2">8. MBE, validade e leitura crítica</h3>
                                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                                        <li>Transforme a dúvida em pergunta estruturada, busque evidência, avalie validade e aplicabilidade e integre-a à experiência clínica e aos valores do paciente.</li>
                                        <li><strong>Viés</strong> é erro sistemático; <strong>confundimento</strong> ocorre quando um terceiro fator se associa à exposição e ao desfecho e distorce a relação.</li>
                                        <li>Distinga significância estatística, tamanho de efeito, relevância clínica e aplicabilidade à população-alvo.</li>
                                        <li>Prefira conclusões proporcionais ao delineamento: “houve associação” é diferente de “a exposição causou o desfecho”.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-indigo-500 pl-2">9. Comunicação e integridade científica</h3>
                                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
                                        <li>O manuscrito deve permitir reprodução: pergunta, fonte, população, período, variáveis, análise, resultados e limitações precisam estar claros.</li>
                                        <li><strong>Plágio</strong> não é apenas copiar palavra por palavra: apresentar ideia, estrutura, dado, imagem ou tradução de outra fonte sem crédito também viola a integridade.</li>
                                        <li><strong>Paráfrase:</strong> compreenda e reescreva genuinamente, sem apenas trocar sinônimos, e mantenha a citação. <strong>Citação direta:</strong> reproduza com fidelidade, use aspas ou bloco e informe página quando aplicável.</li>
                                        <li>Evite autoplágio: reutilização relevante de texto ou resultados próprios anteriores também deve ser identificada e citada. Confira se toda citação aparece nas referências e se toda referência citada foi realmente consultada.</li>
                                        <li>Ferramentas de similaridade ajudam na triagem, mas não decidem sozinhas se há plágio. O uso de IA deve seguir as regras institucionais e editoriais, ser transparente quando exigido e nunca substituir a conferência das fontes.</li>
                                        <li>No banner, priorize legibilidade, hierarquia visual e poucos resultados essenciais; todo gráfico precisa de título, eixos, unidade e fonte.</li>
                                        <li>Escolha periódico e congresso pelo escopo, público e transparência editorial — não apenas por prestígio ou promessa de rapidez.</li>
                                        <li>No Lattes, registre cada produção na categoria e situação verdadeiras. Projeto em andamento, manuscrito aceito e artigo publicado não são equivalentes.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-cyan-500 pl-2">10. Planejamento e instrumentos do SUS</h3>
                                    <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-2">
                                        <div className="rounded-lg bg-slate-50 p-3"><strong>Plano de Saúde (4 anos)</strong><p>Parte da análise situacional e explicita diretrizes, objetivos, metas e indicadores.</p></div>
                                        <div className="rounded-lg bg-slate-50 p-3"><strong>Programação Anual de Saúde</strong><p>Anualiza e operacionaliza as intenções do plano, conectando ações e recursos.</p></div>
                                        <div className="rounded-lg bg-slate-50 p-3"><strong>RDQA</strong><p>Acompanha quadrimestralmente a execução das metas e dos recursos da programação.</p></div>
                                        <div className="rounded-lg bg-slate-50 p-3"><strong>Relatório Anual de Gestão</strong><p>Apresenta os resultados alcançados e apoia avaliação, transparência e controle social.</p></div>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">Uma cadeia coerente liga necessidade de saúde → diretriz → objetivo → meta → indicador → ação → recurso → monitoramento. Indicador sem decisão vira apenas número; decisão sem indicador dificulta saber se houve avanço.</p>
                                </section>

                                <section>
                                    <h3 className="font-bold text-lg text-slate-800 mb-2 border-l-4 border-fuchsia-500 pl-2">11. Ferramentas de gestão em saúde</h3>
                                    <div className="space-y-3 text-sm text-slate-600">
                                        <div className="rounded-xl border border-slate-200 p-4"><strong>SWOT/FOFA — leitura do contexto</strong><p className="mt-1">Forças e fraquezas são internas à organização; oportunidades e ameaças pertencem ao ambiente externo. A matriz ajuda a formular estratégias, mas não substitui indicadores nem participação social.</p></div>
                                        <div className="rounded-xl border border-slate-200 p-4"><strong>Ishikawa ou árvore de problemas — investigação de causas</strong><p className="mt-1">Organize causas potenciais em categorias como pessoas, processos, tecnologia, materiais, gestão e território. Diferencie causa de consequência e confirme as hipóteses com dados; o objetivo não é procurar culpados.</p></div>
                                        <div className="rounded-xl border border-slate-200 p-4"><strong>Matriz GUT — priorização</strong><p className="mt-1">Atribua notas para Gravidade, Urgência e Tendência e calcule G × U × T. A ordenação apoia a decisão, que ainda deve considerar equidade, magnitude, vulnerabilidade, participação e viabilidade.</p></div>
                                        <div className="rounded-xl border border-slate-200 p-4"><strong>5W2H e meta SMART — execução</strong><p className="mt-1">Defina o que, por que, onde, quando, quem, como e quanto custa. Uma meta SMART explicita indicador, linha de base, valor-alvo, população/território e prazo.</p></div>
                                        <div className="rounded-xl border border-slate-200 p-4"><strong>PDCA — aprendizagem contínua</strong><p className="mt-1">Planeje, execute em escala adequada, verifique indicadores de processo e resultado e ajuste. Não espere apenas o fim do ciclo para descobrir que uma ação não funcionou.</p></div>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
                                    <div className="mb-5">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Biblioteca recomendada</p>
                                        <h3 className="mt-1 text-xl font-bold text-slate-900">Fontes confiáveis para continuar estudando</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">Uma seleção revisada de materiais oficiais e referências metodológicas para aprofundar epidemiologia, bioestatística, busca, escrita, integridade e gestão do SUS. Os links abrem em uma nova aba.</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                        {REVIEW_SOURCE_GROUPS.map(group => (
                                            <div key={group.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                                <h4 className="mb-3 text-sm font-bold text-slate-800">{group.title}</h4>
                                                <div className="space-y-3">
                                                    {group.links.map(link => (
                                                        <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="group block rounded-lg border border-transparent p-2 transition-colors hover:border-blue-200 hover:bg-blue-50">
                                                            <span className="flex items-start justify-between gap-2 text-sm font-bold text-blue-700 group-hover:underline">
                                                                {link.label}<span aria-hidden="true" className="shrink-0">↗</span>
                                                            </span>
                                                            <span className="mt-1 block text-xs leading-relaxed text-slate-500">{link.description}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-xs leading-relaxed text-slate-500">Dica: use diretrizes de relato para escrever melhor e ferramentas de avaliação crítica para julgar risco de viés; elas têm finalidades diferentes.</p>
                                </section>
                           </div>
                           
                           <button onClick={() => setShowReviewModal(false)} className="mt-8 w-full bg-slate-800 text-white py-3 rounded font-bold">Voltar ao Certificado</button>
                      </div>
                  </div>
                )}
            </div>
          </>
      );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative font-sans">
      {/* Wallpaper */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029')] bg-cover"></div>

      {popup && <EducationalPopup title={popup.title} content={popup.content} onClose={() => setPopup(null)} />}

      {showFinishPrompt && (
          <div className="absolute inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 border-t-8 border-emerald-500 animate-in zoom-in">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                      <Award size={34}/>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Jornada científica e de gestão completa!</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                      Você concluiu o estudo, a divulgação científica, o portfólio e a Sala de Situação SUS. A nota técnica de gestão foi salva em Meus Arquivos. Agora pode emitir o certificado ou continuar explorando o ambiente.
                  </p>
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button onClick={() => setShowFinishPrompt(false)} className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50">
                          Continuar explorando
                      </button>
                      <button onClick={() => { setShowFinishPrompt(false); setIsGameOver(true); }} className="px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg">
                          Finalizar e ver certificado
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Desktop Icons */}
      <div className="absolute top-3 left-3 right-3 md:right-auto md:top-4 md:left-4 grid grid-cols-4 md:flex md:flex-col gap-3 md:gap-6 z-0">
         {[
             {id: AppID.GUIDE, icon: <BrainCircuit size={32} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]"/>, label: "Chatbots IA"},
             {id: AppID.EXPLORER, icon: <Folder size={32} className="fill-yellow-400 text-yellow-500"/>, label: "Meus Arquivos"},
             {id: AppID.BROWSER, icon: <Globe size={32} className="text-blue-500"/>, label: "Piggle Chrome"},
             {id: AppID.SHEET, icon: <FileSpreadsheet size={32} className="text-green-600"/>, label: "Pigxcel"},
             {id: AppID.WORD, icon: <FileText size={32} className="text-blue-800"/>, label: "Pigword"},
             {id: AppID.HEALTH_MANAGEMENT, icon: <HeartPulse size={32} className="text-cyan-600"/>, label: "Sala SUS"},
         ].map(app => (
             <div key={app.id} onDoubleClick={() => toggleWindow(app.id)} className="flex flex-col items-center gap-1 group cursor-pointer w-24 p-2 hover:bg-white/20 rounded border border-transparent hover:border-white/30 transition-all relative">
                 <div className={`w-14 h-14 bg-white/90 rounded-xl flex items-center justify-center shadow-lg group-active:scale-95 transition-transform backdrop-blur-sm ${getShortcutGlow(app.id)}`}>{app.icon}</div>
                 {app.id === AppID.GUIDE && !windows[AppID.GUIDE].isOpen && (
                     <div className="absolute top-0 right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                 )}
                 <span className="text-white text-xs font-medium shadow-black drop-shadow-md text-center px-1 rounded line-clamp-2 leading-tight bg-black/20">{app.label}</span>
             </div>
         ))}
         <div onDoubleClick={() => toggleWindow(AppID.EXPLORER, 'trash')} className="mt-auto flex flex-col items-center gap-1 group cursor-pointer w-24 p-2 hover:bg-white/20 rounded border border-transparent hover:border-white/30 transition-all">
              <div className="w-14 h-14 bg-transparent flex items-center justify-center group-active:scale-95 transition-transform">
                  <Trash2 size={40} className="text-slate-200 drop-shadow-md"/>
              </div>
              <span className="text-white text-xs font-medium shadow-black drop-shadow-md text-center px-1 rounded bg-black/20">Lixeira</span>
         </div>
      </div>

      {/* Mission Widget */}
      {showMissionWidget && currentScenario ? (
          <div className="absolute top-24 md:top-4 left-2 right-2 md:left-auto md:right-4 z-20 md:z-0 max-h-[72vh] md:max-h-[85vh] overflow-y-auto">
               <div className="w-full md:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-right-10 text-slate-100">
                   <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
                       <Briefcase size={15} className="text-yellow-400"/>
                       <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Metas de Pesquisa</span>
                       <button onClick={() => setShowMissionWidget(false)} className="ml-auto rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white" title="Recolher metas" aria-label="Recolher metas"><XCircle size={14}/></button>
                   </div>
                   <h3 className="font-extrabold text-white text-xs leading-tight mb-3">{currentScenario.title}</h3>
                   
                   {/* Step by Step checklist */}
                   <div className="space-y-2.5 text-[11px]">
                       {[
                           {
                               title: "1. Pergunta Científica (PECO)",
                               description: "Definir P (População), E (Exposição), C (Comparador) e O (Desfecho).",
                               isDone: currentStep > EcologicalStep.PICO_FORMULATION,
                               isActive: currentStep === EcologicalStep.PICO_FORMULATION
                           },
                           {
                               title: "2. Coleta de Dados (DATASUS)",
                               description: "Abra o Piggle Chrome 🌐, acesse o DATASUS / Tabnet e baixe os dados consolidados como .CSV.",
                               isDone: currentStep > EcologicalStep.DATA_COLLECTION,
                               isActive: currentStep === EcologicalStep.DATA_COLLECTION
                           },
                           {
                               title: "3. Análise Estatística (Pigxcel)",
                               description: "Abra o Pigxcel 📊, processe sua planilha .CSV de Downloads e clique em 'Copiar Gráfico/Tabela'.",
                               isDone: currentStep > EcologicalStep.ANALYSIS,
                               isActive: currentStep === EcologicalStep.ANALYSIS
                           },
                           {
                               title: "4. Fichamento Bibliográfico",
                               description: "Abra o PubMed 📚 no navegador e salve pelo menos 2 referências científicas em seu fichário.",
                               isDone: currentStep > EcologicalStep.WRITING || savedReferences.length >= 2,
                               isActive: currentStep === EcologicalStep.WRITING && savedReferences.length < 2
                           },
                           {
                               title: "5. Relatório Científico (Pigword)",
                               description: "Abra o Pigword 📝, cole seus gráficos/tabelas da área de transferência e salve o manuscrito.",
                               isDone: fileSystem.some(file => file.type === 'doc'),
                               isActive: currentStep === EcologicalStep.WRITING && savedReferences.length >= 2 && !fileSystem.some(file => file.type === 'doc')
                           },
                           {
                               title: "6. Parecer do Orientador (Pigmail)",
                               description: currentStep === EcologicalStep.AWAITING_REVIEW ? "O manuscrito foi enviado. Aguarde a resposta e acompanhe a caixa de entrada do Pigmail." : "Envie o manuscrito pelo Pigmail e leia o parecer quando ele chegar.",
                               isDone: currentStep >= EcologicalStep.BANNER_CREATION,
                               isActive: currentStep === EcologicalStep.SUBMISSION || currentStep === EcologicalStep.AWAITING_REVIEW
                           },
                           {
                               title: "7. Banner Científico",
                               description: "Monte o banner com título, introdução, métodos, resultados, discussão, conclusão e referências.",
                               isDone: bannerCompleted,
                               isActive: currentStep === EcologicalStep.BANNER_CREATION
                           },
                           {
                               title: "8. Publicação e Divulgação",
                               description: currentStep === EcologicalStep.CONGRESS_SUBMISSION ? "O artigo foi aceito. Agora escolha um congresso compatível com o tema e o desenho." : "Escolha um periódico confiável e, depois do aceite, um congresso adequado.",
                               isDone: currentStep > EcologicalStep.CONGRESS_SUBMISSION,
                               isActive: currentStep === EcologicalStep.JOURNAL_SUBMISSION || currentStep === EcologicalStep.CONGRESS_SUBMISSION
                           },
                           {
                               title: "9. Portfólio Lattes",
                               description: "Cadastre projeto, artigo, banner e congresso para liberar a missão final de gestão.",
                               isDone: currentStep > EcologicalStep.LATTES_REGISTRATION,
                               isActive: currentStep === EcologicalStep.LATTES_REGISTRATION
                           },
                           {
                               title: "10. Sala de Situação SUS",
                               description: "Transforme a evidência em diagnóstico, indicador, dashboard, análise de causas, prioridade, meta e plano monitorável.",
                               isDone: currentStep === EcologicalStep.COMPLETED,
                               isActive: currentStep === EcologicalStep.HEALTH_MANAGEMENT
                           }
                       ].map((meta, index) => (
                           <div key={index} className={`p-2.5 rounded-xl border transition-all ${
                               meta.isDone 
                                   ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                                   : meta.isActive 
                                       ? 'bg-blue-950/45 border-blue-500/50 text-blue-100 ring-2 ring-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)] font-semibold' 
                                       : 'bg-slate-950/40 border-slate-900/60 text-slate-500'
                           }`}>
                               <div className="flex items-center gap-1.5">
                                   <span>{meta.isDone ? "✅" : meta.isActive ? "⚡" : "🔒"}</span>
                                   <span className={meta.isDone ? "line-through text-slate-500" : ""}>{meta.title}</span>
                               </div>
                               {meta.isActive && (
                                   <p className="text-[10px] text-slate-300 mt-1 leading-relaxed pl-5 font-normal animate-in fade-in">
                                       {meta.description}
                                   </p>
                               )}
                           </div>
                       ))}
                   </div>
               </div>
          </div>
      ) : !showMissionWidget && isLoggedIn && currentScenario && (!windows[AppID.HEALTH_MANAGEMENT].isOpen || windows[AppID.HEALTH_MANAGEMENT].isMinimized) ? (
          <button className="absolute top-20 right-3 md:top-4 md:right-4 z-20 rounded-full border-2 border-white bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xl hover:bg-slate-800" onClick={() => setShowMissionWidget(true)}>
              <Briefcase size={13} className="mr-1 inline text-yellow-400"/> Ver metas
          </button>
      ) : !showMissionWidget && isLoggedIn && !currentScenario && (
          <div className="absolute top-4 right-4 z-0 animate-pulse cursor-pointer" onClick={() => setShowOnboarding(false)}>
              <div className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg font-bold text-xs border-2 border-white">
                  ⚠ Selecione um Protocolo
              </div>
          </div>
      )}

      {/* Windows Layer */}
      <div className="relative flex-1 pointer-events-none z-10">
          {(Object.values(windows) as WindowState[]).map(win => (
              <WindowFrame
                key={win.id}
                windowState={win}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => toggleWindow(win.id)}
                onMaximize={() => setWindows(p => ({...p, [win.id]: {...p[win.id], isMaximized: !p[win.id].isMaximized}}))}
                onFocus={() => focusWindow(win.id)}
                onMove={(x, y) => setWindows(p => ({...p, [win.id]: {...p[win.id], position: {x, y}}}))}
                icon={getAppIcon(win.id)}
              >
                  {win.id === AppID.GUIDE && <Tutor currentScenario={currentScenario} currentStep={currentStep} xp={xp} />}
                  {win.id === AppID.BROWSER && <Browser onSaveFile={handleSaveFile} currentScenario={currentScenario} onEmailSend={handleEmailSend} fileSystem={fileSystem} emails={emails} onSaveReference={handleSaveReference} savedReferences={savedReferences} onLogAction={updateStats} onQuizComplete={(points) => setXp(p => p + points)} currentStep={currentStep} onJournalSubmit={handleJournalSubmissionSuccess} onCongressSuccess={handleCongressSuccess} onLattesSuccess={handleLattesSuccess} inputUser={inputUser} bannerCompleted={bannerCompleted}/>}
                  {win.id === AppID.SHEET && <DataStudio fileSystem={fileSystem} setClipboard={setClipboard} onCopySuccess={handleCopySuccess} initialFile={fileToOpen} />}
                  {win.id === AppID.WORD && <PaperWriter clipboard={clipboard} onSaveFile={handleSaveFile} savedReferences={savedReferences} initialFile={fileToOpen?.type === 'doc' ? fileToOpen : null} onCloseDocument={() => setFileToOpen(null)} />}
                  {win.id === AppID.EXPLORER && <Explorer fileSystem={fileSystem} startPath={explorerStartPath} onOpenFile={handleOpenFileFromExplorer} onDeleteFile={handleDeleteFile} onRestoreFile={handleRestoreFile} />}
                  {win.id === AppID.SETTINGS && (
                      <div className="h-full bg-slate-900 text-white p-0 flex flex-col overflow-hidden relative font-mono">
                          <div className="absolute inset-0 bg-[url('https://cdn.pixabay.com/photo/2018/05/08/08/44/artificial-intelligence-3382507_1280.jpg')] bg-cover opacity-10"></div>
                          <div className="p-5 md:p-8 z-10 flex-1 flex flex-col items-center justify-start md:justify-center text-center overflow-y-auto overscroll-contain">
                             <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-pulse">
                                 <Cpu size={40} className="text-white"/>
                             </div>
                             <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 tracking-widest">ECOSTUDY OS</h2>
                             <p className="text-slate-400 text-xs mb-8 tracking-[0.2em] uppercase">System Kernel v2.5.0</p>
                             
                             <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl w-full max-w-sm max-h-48 overflow-y-auto">
                                 <h3 className="text-xs font-bold text-slate-300 uppercase mb-4 border-b border-white/10 pb-2">Autores do simulador</h3>
                                 <ul className="space-y-3 text-sm">
                                     <li className="flex items-center justify-between group">
                                         <span className="text-slate-400 group-hover:text-white transition-colors">Autor</span>
                                         <span className="font-bold text-blue-400">Thales Báccaro</span>
                                     </li>
                                     <li className="flex items-center justify-between group">
                                         <span className="text-slate-400 group-hover:text-white transition-colors">Autor</span>
                                         <span className="font-bold text-green-400">Leonardo Sartori</span>
                                     </li>
                                     <li className="flex items-center justify-between group">
                                         <span className="text-slate-400 group-hover:text-white transition-colors">Autor</span>
                                         <span className="font-bold text-purple-400">Theo Báccaro</span>
                                     </li>
                                 </ul>
                             </div>
                             <div className="mt-6 flex gap-2 text-[10px] text-slate-500">
                                 <span className="flex items-center gap-1"><HeartPulse size={10}/> Made for PIG IV</span>
                             </div>
                          </div>
                      </div>
                  )}
                  {win.id === AppID.BANNER && <BannerDesigner onFinish={() => handleEmailSend('BANNER_FINISHED')}/>}
                  {win.id === AppID.HEALTH_MANAGEMENT && <HealthManagement currentScenario={currentScenario} inputUser={inputUser} onMistake={() => updateStats('managementMistakes')} onComplete={handleHealthManagementComplete}/>}
              </WindowFrame>
          ))}
      </div>

      {/* ... (Onboarding/Phase 1/Phase 2 Modals Remain Unchanged) ... */}
      {!currentScenario && showOnboarding && (
          <div className="absolute inset-0 z-[60] bg-slate-950/98 backdrop-blur-md flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto animate-in fade-in duration-300">
              <div className="w-full max-w-6xl py-4 md:py-0">
                   <div className="flex items-start md:items-center gap-3 md:gap-5 mb-6 md:mb-8 border-b border-slate-800 pb-5 md:pb-6">
                      <div className="bg-gradient-to-br from-yellow-400 to-amber-500 p-3 rounded-2xl text-slate-950 shadow-lg shadow-yellow-500/10">
                        <Briefcase size={32} className="stroke-[2.5]" />
                      </div>
                      <div>
                         <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Dossiês de Protocolos de Pesquisa</h2>
                        <p className="text-slate-400 text-sm font-light mt-1">Selecione um protocolo epidemiológico para iniciar sua investigação com dados secundários agregados.</p>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {SCENARIOS.map(s => {
                          const systemColors: Record<string, string> = {
                              SINAN: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
                              SIM: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
                              SIH: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30 text-sky-300',
                          };
                          const systemBadge = systemColors[s.correctSystem] || 'from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-300';
                          return (
                              <div 
                                  key={s.id} 
                                  onClick={() => handleScenarioSelect(s)} 
                                  className="bg-slate-900/60 border border-slate-800 hover:border-yellow-500/50 hover:bg-slate-900/90 p-6 rounded-2xl cursor-pointer group transition-all duration-300 flex flex-col min-h-[360px] md:h-[400px] hover:-translate-y-2 shadow-2xl relative overflow-hidden"
                              >
                                  {/* Top Accent line */}
                                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                  
                                  <div className="flex justify-between items-center mb-3">
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full border bg-gradient-to-r ${systemBadge} font-mono font-bold tracking-wider uppercase`}>
                                          {s.correctSystem}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-mono">Dossiê {s.id.toUpperCase()}</span>
                                  </div>

                                  <h3 className="font-bold text-base text-white group-hover:text-yellow-400 transition-colors leading-snug min-h-[4.25rem] mb-3">
                                      {s.title}
                                  </h3>
                                  
                                  <p className="text-xs text-slate-400 leading-relaxed flex-1 border-t border-slate-800 pt-3 line-clamp-5">
                                      {s.description}
                                  </p>

                                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-col gap-2">
                                      <div className="text-[10px] text-slate-500">
                                          <strong className="text-slate-400">Palavras-chave:</strong> {s.recommendedKeywords.join(', ')}
                                      </div>
                                      <button className="w-full py-2.5 bg-blue-600/10 text-blue-400 border border-blue-600/20 rounded-xl text-xs font-bold group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300 flex items-center justify-center gap-2 tracking-wider shadow-sm">
                                          <span>INICIAR DOSSIÊ</span> 
                                          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                                      </button>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}

      {/* Phase 1: Design Choice */}
      {currentScenario && currentStep === EcologicalStep.STUDY_DESIGN_CHOICE && (
           <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start md:items-center justify-center overflow-y-auto p-3 md:p-6">
              <div className="bg-white rounded-2xl p-0 max-w-3xl w-full shadow-2xl animate-in zoom-in overflow-hidden flex flex-col md:flex-row my-auto max-h-[94dvh]">
                  <div className="w-full md:w-1/3 bg-slate-100 p-5 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
                      <div className="mb-6">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Protocolo Ativo</div>
                          <h3 className="font-bold text-xl text-blue-900">{currentScenario.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">Você precisa investigar a relação entre as variáveis deste tema usando dados secundários.</p>
                  </div>
                   <div className="flex-1 p-5 md:p-8 flex flex-col overflow-y-auto">
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-5 md:mb-6 flex items-center gap-2"><Lightbulb className="text-yellow-500 shrink-0"/> Fase 1: Desenho Metodológico</h2>
                    {!designFeedback ? (
                        <>
                            <div className="space-y-3 flex-1">
                                {['coorte', 'ecologico', 'clinico'].map((type) => (
                                    <button 
                                        key={type}
                                        onClick={() => setSelectedDesign(type)} 
                                        className={`w-full p-4 border rounded-xl text-left transition-all ${
                                            selectedDesign === type 
                                            ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300' 
                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                        }`}
                                    >
                                        <span className="font-bold block mb-1">
                                            {type === 'coorte' ? 'Estudo de Coorte' : type === 'ecologico' ? 'Estudo Ecológico' : 'Ensaio Clínico'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={confirmDesignChoice} 
                                disabled={!selectedDesign}
                                className="mt-6 w-full bg-slate-800 text-white py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-slate-900"
                            >
                                Confirmar Escolha
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${designFeedback.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {designFeedback.correct ? <CheckCircle size={32}/> : <XCircle size={32}/>}
                            </div>
                            <h3 className={`text-xl font-bold mb-2 ${designFeedback.correct ? 'text-green-800' : 'text-red-800'}`}>
                                {designFeedback.correct ? 'Correto!' : 'Incorreto'}
                            </h3>
                            <p className="text-slate-600 mb-6">{designFeedback.msg}</p>
                            {!designFeedback.correct && (
                                <button onClick={() => {setDesignFeedback(null); setSelectedDesign(null);}} className="text-sm font-bold text-blue-600 hover:underline">
                                    Tentar Novamente
                                </button>
                            )}
                        </div>
                    )}
                  </div>
              </div>
          </div>
      )}

      {/* Phase 2: PECO Form */}
      {currentScenario && currentStep === EcologicalStep.PICO_FORMULATION && !popup && (
           <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-start md:items-center justify-center overflow-y-auto p-3 md:p-6">
               <div className="bg-white rounded-2xl p-4 md:p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in border-t-8 border-yellow-400 relative my-auto max-h-[94dvh] overflow-y-auto">
                  <div className="absolute -top-6 left-8 bg-yellow-400 text-blue-900 px-4 py-1 rounded-full font-bold text-sm shadow-md flex items-center gap-2">
                      <Briefcase size={16}/> Fase 2: Estratégia PECO
                  </div>
                   <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-5 md:mb-6 mt-3 md:mt-2">
                      <p className="text-sm text-slate-600">Defina os elementos da pesquisa para o tema <strong>"{currentScenario.title}"</strong>.</p>
                      <button onClick={() => setShowPicoTutorial(true)} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"><HelpCircle size={14}/> Como preencher?</button>
                  </div>
                  
                   <div className="space-y-4 bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-blue-800 mb-1"><User size={12}/> P (População - Agregado)</label>
                            <input value={picoP} onChange={e=>setPicoP(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 ring-blue-200 outline-none" placeholder="Ex: Municípios do Estado de SP..."/>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1">E (Exposição populacional)</label>
                                <input value={picoI} onChange={e=>setPicoI(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 ring-blue-200 outline-none" placeholder="Ex: Alta urbanização..."/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-800 mb-1">C (Comparador)</label>
                                <input value={picoC} onChange={e=>setPicoC(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 ring-blue-200 outline-none" placeholder="Ex: Baixa urbanização..."/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-800 mb-1">O (Desfecho/Outcome)</label>
                            <input value={picoO} onChange={e=>setPicoO(e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 ring-blue-200 outline-none" placeholder="Ex: Incidência de Dengue..."/>
                        </div>
                      </div>
                  </div>
                  {picoFeedback && (
                      <div className="mt-4 bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded text-sm flex items-start gap-3">
                          <AlertTriangle className="shrink-0 mt-0.5" size={18}/>
                          <div>
                            <strong>Atenção:</strong> {picoFeedback}
                          </div>
                      </div>
                  )}
                  <button 
                    onClick={handlePICOSubmit} 
                    disabled={picoLoading || !picoP || !picoO}
                    className="mt-6 w-full bg-blue-600 disabled:bg-slate-300 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex justify-center items-center gap-2 text-lg"
                  >
                      {picoLoading ? "Analisando compatibilidade..." : "Validar Estratégia"} {picoLoading ? '' : <CheckCircle size={20}/>}
                  </button>
              </div>
          </div>
      )}

      {/* PECO Tutorial Modal */}
      {showPicoTutorial && (
          <div className="absolute inset-0 z-[70] bg-black/60 flex items-start md:items-center justify-center p-3 md:p-4 overflow-y-auto">
              <div className="bg-white rounded-xl max-w-lg w-full p-4 md:p-6 animate-in zoom-in my-auto max-h-[94dvh] overflow-y-auto">
                  <div className="flex justify-between mb-4">
                      <h3 className="font-bold text-lg text-blue-900">Guia PECO para estudos ecológicos</h3>
                      <button onClick={() => setShowPicoTutorial(false)}><XCircle size={20} className="text-slate-400"/></button>
                  </div>
                  <div className="space-y-4 text-sm text-slate-700">
                      <p><strong>PECO</strong> significa <strong>P (População)</strong>, <strong>E (Exposição)</strong>, <strong>C (Comparador)</strong> e <strong>O (Desfecho, do inglês Outcome)</strong>.</p>
                      <p>Em estudos ecológicos com dados secundários, a unidade analisada é um grupo populacional — por exemplo, municípios ou regiões. Por isso, usamos <strong>E de Exposição</strong>, e não uma intervenção clínica aplicada individualmente.</p>
                      <div className="bg-blue-50 p-3 rounded border border-blue-100">
                          <strong className="block mb-1 text-blue-800">Exemplo Correto (Ecológico):</strong>
                          <ul className="list-disc pl-4 space-y-1">
                              <li><strong>P (População):</strong> municípios do Acre</li>
                              <li><strong>E (Exposição):</strong> nível municipal de exposição à fumaça de queimadas</li>
                              <li><strong>C (Comparador):</strong> municípios com menor nível de exposição</li>
                              <li><strong>O (Desfecho/Outcome):</strong> taxa municipal de internações por asma</li>
                          </ul>
                      </div>
                      <div className="bg-amber-50 p-3 rounded border border-amber-200 text-amber-900">
                          <strong className="block mb-1">Cuidado com a falácia ecológica</strong>
                          Uma associação entre municípios não demonstra que cada indivíduo mais exposto terá o desfecho. A conclusão deve permanecer no nível populacional.
                      </div>
                      <div className="bg-red-50 p-3 rounded border border-red-100">
                          <strong className="block mb-1 text-red-800">Exemplo Errado (Clínico):</strong>
                          <p>Dar remédio X para Paciente Y. (Isso não se aplica aqui pois usamos dados agregados do DATASUS).</p>
                      </div>
                  </div>
                  <button onClick={() => setShowPicoTutorial(false)} className="w-full bg-slate-800 text-white py-2 rounded mt-6 font-bold">Entendi</button>
              </div>
          </div>
      )}

      {/* Taskbar */}
      <div className="h-12 bg-slate-900/95 backdrop-blur text-white flex items-center px-2 md:px-4 z-50 gap-1 md:gap-2 shadow-[0_-2px_10px_rgba(0,0,0,0.5)] overflow-x-auto overflow-y-hidden">
         <button onClick={() => setMenuOpen(!menuOpen)} className={`p-2 rounded transition-all ${menuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}><Monitor size={20}/></button>
         <div className="h-6 w-px bg-white/20 mx-2"></div>
         {(Object.values(windows) as WindowState[]).filter(w => w.isOpen).map(w => (
             <button key={w.id} onClick={() => toggleWindow(w.id)} className={`h-9 px-2 md:px-3 rounded text-xs font-medium flex items-center gap-2 transition-all border-b-2 shrink-0 ${activeAppId === w.id && !w.isMinimized ? 'bg-white/10 border-blue-400' : 'hover:bg-white/5 border-transparent text-slate-300'}`}>
                 <div className="w-4 h-4 bg-white rounded flex items-center justify-center text-slate-900 font-bold text-[8px]">
                    {w.id.charAt(0).toUpperCase()}
                 </div> 
                 <span className="hidden sm:inline max-w-[100px] truncate">{w.title}</span>
             </button>
         ))}
         <div className="flex-1"></div>
         <div className="flex items-center gap-3 text-xs font-medium text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
             <Award size={14} className="text-yellow-400"/>
             <span>XP: {xp}</span>
         </div>
         <div className="w-px h-6 bg-white/20 mx-2"></div>
         <div className="text-xs font-mono text-slate-300">{new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
      </div>
      {/* Start Menu Logic ... (Unchanged) */}
      {menuOpen && (
          <div className="absolute bottom-14 left-2 w-72 bg-slate-800/95 backdrop-blur-md text-white rounded-lg shadow-2xl border border-white/20 z-[70] overflow-hidden animate-in slide-in-from-bottom-5">
              <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">{inputUser.charAt(0).toUpperCase()}</div>
                  <div>
                      <div className="font-bold text-sm">{inputUser || 'Aluno'}</div>
                      <div className="text-[10px] text-slate-400">Faculdade de Medicina</div>
                  </div>
              </div>
              <div className="p-2 space-y-1">
                  {[
                      {id: AppID.GUIDE, label: "Chatbots de Pesquisa IA"},
                      {id: AppID.EXPLORER, label: "Explorador de Arquivos"},
                      {id: AppID.BROWSER, label: "Piggle Chrome"},
                      {id: AppID.SHEET, label: "Pigxcel"},
                      {id: AppID.WORD, label: "Pigword"},
                      {id: AppID.SETTINGS, label: "Sobre o Sistema"},
                  ].map(item => (
                      <button key={item.id} onClick={() => toggleWindow(item.id as AppID)} className="w-full text-left p-2 hover:bg-white/10 rounded-md text-sm flex items-center gap-3 transition-colors">
                           <PlayCircle size={14} className="text-blue-400"/> {item.label}
                      </button>
                  ))}
              </div>
              <div className="border-t border-white/10 p-2 bg-slate-900/50">
                  <button onClick={handleRestart} className="w-full text-left p-2 hover:bg-red-500/20 hover:text-red-200 rounded-md text-sm flex items-center gap-3 text-slate-300 transition-colors">
                      <Power size={14}/> Desligar Sistema
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
