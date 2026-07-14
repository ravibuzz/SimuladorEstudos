import React, { useMemo, useState } from 'react';
import {
  Activity, ArrowRight, BarChart3, BookOpen, CheckCircle2, ClipboardCheck,
  ExternalLink, Gauge, LayoutDashboard, MapPinned, RotateCcw, ShieldCheck,
  Sparkles, Target, TrendingDown, TrendingUp, Users, XCircle
} from 'lucide-react';
import { Scenario } from '../../types';

export interface HealthManagementResult {
  score: number;
  indicator: string;
  baseline: string;
  target: string;
  dashboardMode: 'technical' | 'citizen';
  dashboardYear: number;
  dashboardTerritory: string;
  dashboardCards: string[];
  interventions: string[];
  smartGoal: string;
  processIndicator: string;
  resultStatement: string;
  impactStatement: string;
  consequences: string[];
}

interface HealthManagementProps {
  currentScenario: Scenario | null;
  inputUser?: string;
  onComplete: (result: HealthManagementResult) => void;
  onMistake?: () => void;
}

type CaseConfig = {
  city: string;
  problem: string;
  indicator: string;
  unit: string;
  years: number[];
  values: number[];
  targetValue: number;
  baseline: string;
  priorityOption: string;
  denominator: string;
  smartGoal: string;
  publicMessage: string;
  processIndicator: string;
  resultStatement: string;
  impactStatement: string;
  territories: { name: string; values: number[] }[];
};

const CASES: Record<string, CaseConfig> = {
  dengue_sp: {
    city: 'Município de Araras (SP)', problem: 'crescimento persistente da incidência de dengue',
    indicator: 'Incidência de dengue por 100 mil habitantes', unit: 'por 100 mil hab.',
    years: [2021, 2022, 2023, 2024, 2025], values: [185, 212, 281, 365, 410], targetValue: 328,
    baseline: '410 casos por 100 mil habitantes em 2025', priorityOption: 'main',
    denominator: 'População residente no município no mesmo período',
    smartGoal: 'Reduzir a incidência de dengue de 410 para no máximo 328 casos por 100 mil habitantes até dezembro de 2029.',
    publicMessage: 'A dengue aumentou nos últimos anos. O município vai agir nos territórios mais afetados e acompanhar a incidência regularmente.',
    processIndicator: 'Proporção dos territórios prioritários com busca ativa e ação intersetorial executadas no mês',
    resultStatement: 'Maior cobertura das ações e eliminação oportuna de focos nos territórios de maior risco',
    impactStatement: 'Redução sustentada da incidência de dengue no município ao longo dos anos',
    territories: [{ name: 'Norte', values: [225, 268, 349, 460, 515] }, { name: 'Centro', values: [174, 195, 248, 326, 372] }, { name: 'Sul', values: [142, 157, 202, 251, 288] }]
  },
  infant_mortality: {
    city: 'Município de Araras (SP)', problem: 'mortalidade infantil acima da meta municipal',
    indicator: 'Coeficiente de mortalidade infantil', unit: 'por mil nascidos vivos',
    years: [2021, 2022, 2023, 2024, 2025], values: [15.8, 15.2, 15.5, 14.9, 14.7], targetValue: 12.5,
    baseline: '14,7 óbitos menores de um ano por mil nascidos vivos em 2025', priorityOption: 'main',
    denominator: 'Nascidos vivos de mães residentes no mesmo período',
    smartGoal: 'Reduzir o coeficiente de mortalidade infantil de 14,7 para no máximo 12,5 por mil nascidos vivos até dezembro de 2029.',
    publicMessage: 'A mortalidade infantil apresentou pequena redução, mas permanece prioritária. O plano reforçará pré-natal, puerpério e cuidado ao recém-nascido.',
    processIndicator: 'Proporção de gestantes dos territórios prioritários com pré-natal iniciado até a 12ª semana',
    resultStatement: 'Maior acesso oportuno ao pré-natal, puerpério e cuidado neonatal coordenado',
    impactStatement: 'Redução sustentada da mortalidade infantil no município ao longo dos anos',
    territories: [{ name: 'Rural', values: [20.2, 19.4, 19.8, 19.1, 18.6] }, { name: 'Norte', values: [16.7, 16.1, 16.4, 15.6, 15.1] }, { name: 'Centro', values: [12.8, 12.4, 12.6, 12.1, 11.9] }]
  },
  tb_aids: {
    city: 'Município de Araras (SP)', problem: 'aumento da proporção de coinfecção tuberculose-HIV',
    indicator: 'Proporção de casos novos de TB com coinfecção HIV', unit: '% dos casos novos de TB',
    years: [2021, 2022, 2023, 2024, 2025], values: [9.8, 10.4, 10.9, 11.7, 12.4], targetValue: 10.5,
    baseline: '12,4% dos casos novos de tuberculose em 2025', priorityOption: 'main',
    denominator: 'Total de casos novos de tuberculose no mesmo local e período',
    smartGoal: 'Reduzir a proporção de coinfecção TB-HIV de 12,4% para no máximo 10,5% até dezembro de 2029.',
    publicMessage: 'A coinfecção TB-HIV aumentou. O município ampliará testagem, integração do cuidado e acompanhamento sem culpabilizar as pessoas afetadas.',
    processIndicator: 'Proporção de casos novos de tuberculose testados para HIV e vinculados ao cuidado oportunamente',
    resultStatement: 'Maior testagem, diagnóstico oportuno e continuidade do cuidado integrado TB-HIV',
    impactStatement: 'Redução sustentada da coinfecção e de desfechos desfavoráveis no município',
    territories: [{ name: 'Centro', values: [11.7, 12.6, 13.3, 14.2, 15.2] }, { name: 'Leste', values: [9.3, 9.8, 10.4, 11.2, 12.1] }, { name: 'Oeste', values: [7.8, 8.0, 8.2, 8.5, 8.8] }]
  },
  asthma_poluicao: {
    city: 'Município de Araras (SP)', problem: 'crescimento das internações por asma',
    indicator: 'Taxa de internação por asma', unit: 'por 10 mil hab.',
    years: [2021, 2022, 2023, 2024, 2025], values: [22, 24, 23, 28, 31], targetValue: 26,
    baseline: '31 internações por 10 mil habitantes em 2025', priorityOption: 'main',
    denominator: 'População residente na faixa etária definida, no mesmo período',
    smartGoal: 'Reduzir a taxa de internação por asma de 31 para no máximo 26 por 10 mil habitantes até dezembro de 2029.',
    publicMessage: 'As internações por asma cresceram. O município reforçará o cuidado na atenção primária e investigará fatores ambientais e de acesso.',
    processIndicator: 'Proporção das unidades prioritárias com plano de cuidado e acompanhamento de pessoas com asma',
    resultStatement: 'Maior controle clínico, acesso a medicamentos e manejo oportuno das exacerbações',
    impactStatement: 'Redução sustentada das internações evitáveis por asma no município',
    territories: [{ name: 'Industrial', values: [28, 30, 29, 35, 39] }, { name: 'Centro', values: [21, 23, 22, 26, 29] }, { name: 'Rural', values: [17, 18, 18, 20, 21] }]
  }
};

const DASHBOARD_CARDS = [
  ['current', 'Valor atual'], ['baseline', 'Linha de base'], ['target', 'Meta'],
  ['quality', 'Qualidade do dado'], ['territory', 'Maior desigualdade territorial']
] as const;

const CLASSIFICATION_ITEMS = [
  { id: 'team', text: 'Equipe de APS experiente e com baixa rotatividade', correct: 'Força', group: 'SWOT/FOFA' },
  { id: 'records', text: 'Cadastros territoriais incompletos e prontuários pouco integrados', correct: 'Fraqueza', group: 'SWOT/FOFA' },
  { id: 'university', text: 'Universidade local oferece parceria para qualificar a análise', correct: 'Oportunidade', group: 'SWOT/FOFA' },
  { id: 'budget', text: 'Possibilidade de redução de repasses no próximo exercício', correct: 'Ameaça', group: 'SWOT/FOFA' },
  { id: 'people', text: 'Rotatividade e treinamento insuficiente dos profissionais', correct: 'Mão de obra / Pessoas', group: 'Ishikawa — 6M' },
  { id: 'method', text: 'Busca ativa sem fluxo, responsável ou protocolo definidos', correct: 'Método / Processos', group: 'Ishikawa — 6M' },
  { id: 'machine', text: 'Sistemas de informação que não trocam dados entre si', correct: 'Máquina / Tecnologia', group: 'Ishikawa — 6M' },
  { id: 'material', text: 'Falta de testes, formulários ou insumos para executar a ação', correct: 'Material / Insumos', group: 'Ishikawa — 6M' },
  { id: 'environment', text: 'Barreiras de transporte e distância até os serviços', correct: 'Meio ambiente / Território', group: 'Ishikawa — 6M' },
  { id: 'measure', text: 'Definições divergentes e denominadores desatualizados', correct: 'Medida / Mensuração', group: 'Ishikawa — 6M' }
];

const INTERVENTIONS = [
  { id: 'territory', title: 'Ação territorial integrada', cost: 60, good: true, description: 'Estratificação de risco, busca ativa e cuidado coordenado nos territórios prioritários.', consequence: 'Aumenta a equidade e alcança quem mais precisa, mas exige coordenação entre equipes.' },
  { id: 'surveillance', title: 'Vigilância e qualidade do dado', cost: 40, good: true, description: 'Qualificar registros, denominadores e monitoramento mensal.', consequence: 'Torna o painel confiável e permite corrigir a rota; o efeito no desfecho não é imediato.' },
  { id: 'campaign', title: 'Campanha genérica de mídia', cost: 55, good: false, description: 'Comunicação sem segmentação territorial nem avaliação definida.', consequence: 'Consome mais da metade do orçamento, mas pode não alcançar os grupos prioritários.' },
  { id: 'equipment', title: 'Compra isolada de equipamento', cost: 70, good: false, description: 'Aquisição sem diagnóstico do gargalo, plano de uso ou equipe responsável.', consequence: 'Cria risco de recurso ocioso e deixa as causas organizacionais sem resposta.' }
];

const STAGES = ['Convocação', 'Diagnóstico', 'Dashboard', 'Causas', 'Plano', 'Cadeia lógica', 'Monitoramento'];

const Metric = ({ label, value, tone = 'cyan' }: { label: string; value: string; tone?: 'cyan' | 'amber' | 'emerald' }) => (
  <div className={`rounded-2xl border p-4 ${tone === 'amber' ? 'border-amber-700/50 bg-amber-950/30' : tone === 'emerald' ? 'border-emerald-700/50 bg-emerald-950/30' : 'border-cyan-800/60 bg-cyan-950/30'}`}>
    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-sm font-black text-white">{value}</div>
  </div>
);

const ChoiceBlock = ({ title, value, onChange, options }: { title: string; value: string; onChange: (value: string) => void; options: readonly (readonly [string, string])[] }) => (
  <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
    <h3 className="mb-3 text-sm font-black text-slate-100">{title}</h3>
    <div className="grid gap-2">{options.map(([id, label]) => <button key={id} onClick={() => onChange(id)} className={`rounded-xl border p-3 text-left text-xs leading-relaxed ${value === id ? 'border-cyan-400 bg-cyan-950 text-cyan-100' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'}`}>{label}</button>)}</div>
  </section>
);

export const HealthManagement: React.FC<HealthManagementProps> = ({ currentScenario, inputUser, onComplete, onMistake }) => {
  const config = CASES[currentScenario?.id || ''] || CASES.dengue_sp;
  const [stage, setStage] = useState(0);
  const [priority, setPriority] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [dashboardCards, setDashboardCards] = useState<string[]>([]);
  const [chartChoice, setChartChoice] = useState('');
  const [comparisonChoice, setComparisonChoice] = useState('');
  const [denominator, setDenominator] = useState('');
  const [filterYear, setFilterYear] = useState(config.years.at(-1) || 2025);
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [dashboardMode, setDashboardMode] = useState<'technical' | 'citizen'>('technical');
  const [viewedCitizen, setViewedCitizen] = useState(false);
  const [testedAnotherYear, setTestedAnotherYear] = useState(false);
  const [testedTerritory, setTestedTerritory] = useState(false);
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [gutPriority, setGutPriority] = useState('');
  const [processIndicator, setProcessIndicator] = useState('');
  const [resultStatement, setResultStatement] = useState('');
  const [impactStatement, setImpactStatement] = useState('');
  const [goal, setGoal] = useState('');
  const [monitoring, setMonitoring] = useState('');
  const [publicMessage, setPublicMessage] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);

  const classificationScore = CLASSIFICATION_ITEMS.filter(item => classifications[item.id] === item.correct).length;
  const budget = selectedInterventions.reduce((sum, id) => sum + (INTERVENTIONS.find(item => item.id === id)?.cost || 0), 0);
  const score = Math.max(60, 100 - mistakes * 4);
  const currentIndex = Math.max(0, config.years.indexOf(filterYear));
  const selectedTerritoryData = config.territories.find(item => item.name === selectedTerritory);
  const selectedSeries = selectedTerritoryData?.values || config.values;
  const placeLabel = selectedTerritory === 'all' ? 'Todo o município' : `Território ${selectedTerritory}`;
  const currentValue = selectedSeries[currentIndex];
  const previousValue = selectedSeries[Math.max(0, currentIndex - 1)];
  const trendPercent = currentIndex === 0 ? 0 : ((currentValue - previousValue) / Math.max(Math.abs(previousValue), 0.01)) * 100;
  const yearTerritories = config.territories.map(item => ({ name: item.name, value: item.values[currentIndex] }));
  const maxTerritory = Math.max(...yearTerritories.map(item => item.value));
  const priorityTerritory = yearTerritories.find(item => item.value === maxTerritory);
  const dataCompleteness = [74, 77, 79, 81, 82][currentIndex] || 82;
  const isHistorical = filterYear < (config.years.at(-1) || 2025);
  const isAtTarget = !isHistorical && currentValue <= config.targetValue;
  const distanceToTarget = Math.max(0, currentValue - config.targetValue);
  const selectedConsequences = INTERVENTIONS.filter(item => selectedInterventions.includes(item.id)).map(item => item.consequence);
  const linePoints = useMemo(() => {
    const min = Math.min(...selectedSeries); const max = Math.max(...selectedSeries);
    return selectedSeries.map((value, index) => `${22 + index * 66},${104 - ((value - min) / Math.max(1, max - min)) * 72}`).join(' ');
  }, [selectedSeries]);

  const fail = (text: string) => { setFeedback({ ok: false, text }); setMistakes(value => value + 1); onMistake?.(); };
  const advance = (text: string) => { setFeedback({ ok: true, text }); window.setTimeout(() => { setFeedback(null); setStage(value => Math.min(6, value + 1)); }, 850); };
  const toggleCard = (id: string) => setDashboardCards(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  const toggleIntervention = (id: string) => setSelectedInterventions(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);

  const validateStage = () => {
    if (stage === 1) {
      if (priority !== 'main' || interpretation !== 'trend') return fail('Revise magnitude, tendência e limites do desenho. Priorizar um problema não é provar causalidade individual.');
      return advance('Diagnóstico aprovado: você priorizou um padrão populacional relevante sem ultrapassar o que os dados permitem concluir.');
    }
    if (stage === 2) {
      const essentials = ['current', 'baseline', 'target', 'quality', 'territory'].every(id => dashboardCards.includes(id));
      if (!essentials || chartChoice !== 'line' || comparisonChoice !== 'bar' || denominator !== config.denominator || !viewedCitizen || !testedAnotherYear || !testedTerritory) return fail('Um painel decisório precisa dos cinco cartões, gráficos adequados e denominador correto. Teste também outro ano, um território e a versão cidadã para verificar como a leitura muda.');
      return advance('Dashboard validado: você combinou tendência, território, meta, filtros e transparência sobre a qualidade do dado.');
    }
    if (stage === 3) {
      if (classificationScore < CLASSIFICATION_ITEMS.length) return fail(`Você acertou ${classificationScore} de ${CLASSIFICATION_ITEMS.length}. No Ishikawa 6M, use: Mão de obra, Método, Máquina, Material, Meio ambiente e Medida — adaptados ao contexto da saúde.`);
      return advance('Análise sistêmica concluída: SWOT/FOFA e as seis categorias do Ishikawa foram aplicadas sem procurar culpados.');
    }
    if (stage === 4) {
      const correct = selectedInterventions.length === 2 && ['territory', 'surveillance'].every(id => selectedInterventions.includes(id));
      if (gutPriority !== 'main' || budget > 100 || !correct) return fail('Compare as consequências: a combinação deve caber em 100 créditos, atacar causas modificáveis e permitir medir execução e resultado.');
      return advance('Plano viável: as duas ações se complementam e as consequências esperadas estão explícitas.');
    }
    if (stage === 5) {
      if (processIndicator !== config.processIndicator || resultStatement !== config.resultStatement || impactStatement !== config.impactStatement) return fail('Não pule do que a equipe faz diretamente para um impacto distante. Ligue ação → processo → resultado → impacto.');
      return advance('Cadeia lógica coerente: agora é possível saber cedo se a ação foi executada e, depois, se produziu resultado e impacto.');
    }
    if (stage === 6) {
      if (goal !== config.smartGoal || monitoring !== 'monthly-quarterly' || publicMessage !== config.publicMessage) return fail('A meta precisa de linha de base, alvo e prazo; o monitoramento deve combinar processo mensal e resultado trimestral, com comunicação clara.');
      setFeedback({ ok: true, text: 'Missão concluída: o estudo agora sustenta um dashboard, um plano monitorável e uma comunicação compreensível.' }); setCompleted(true);
    }
  };

  const result: HealthManagementResult = {
    score, indicator: config.indicator, baseline: config.baseline, target: config.smartGoal,
    dashboardMode, dashboardYear: filterYear, dashboardTerritory: placeLabel, dashboardCards, interventions: INTERVENTIONS.filter(item => selectedInterventions.includes(item.id)).map(item => item.title),
    smartGoal: config.smartGoal, processIndicator: config.processIndicator, resultStatement: config.resultStatement,
    impactStatement: config.impactStatement, consequences: selectedConsequences
  };

  const restartModule = () => {
    setStage(0); setPriority(''); setInterpretation(''); setDashboardCards([]); setChartChoice(''); setComparisonChoice(''); setDenominator(''); setFilterYear(config.years.at(-1) || 2025); setSelectedTerritory('all'); setDashboardMode('technical'); setViewedCitizen(false); setTestedAnotherYear(false); setTestedTerritory(false); setClassifications({}); setSelectedInterventions([]); setGutPriority(''); setProcessIndicator(''); setResultStatement(''); setImpactStatement(''); setGoal(''); setMonitoring(''); setPublicMessage(''); setFeedback(null); setMistakes(0); setCompleted(false);
  };

  const Header = () => <div className="shrink-0 border-b border-cyan-900/60 bg-slate-950 px-4 py-3 text-white md:px-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-400/15 p-2 text-cyan-300"><Activity size={24}/></div><div><h1 className="text-sm font-black tracking-wide md:text-base">SALA DE SITUAÇÃO SUS</h1><p className="text-[10px] text-cyan-200/70">EVIDÊNCIA • PLANEJAMENTO • DECISÃO</p></div></div><div className="rounded-full border border-cyan-800 bg-cyan-950/60 px-3 py-1 text-[10px] font-bold text-cyan-200">{config.city}</div></div>
    <div className="mt-3 flex gap-1 overflow-x-auto pb-1">{STAGES.map((label, index) => <div key={label} className={`min-w-[92px] flex-1 rounded-lg border px-2 py-1.5 text-center text-[9px] font-bold ${index < stage ? 'border-emerald-700 bg-emerald-950/50 text-emerald-300' : index === stage ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>{index < stage ? '✓ ' : `${index + 1}. `}{label}</div>)}</div>
  </div>;

  const formatValue = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const citizenTrend = currentIndex === 0
    ? 'Este é o primeiro ano disponível para comparação.'
    : trendPercent < 0
      ? `O indicador melhorou ${Math.abs(trendPercent).toFixed(1).replace('.', ',')}% em relação a ${config.years[currentIndex - 1]}.`
      : trendPercent > 0
        ? `O indicador piorou ${trendPercent.toFixed(1).replace('.', ',')}% em relação a ${config.years[currentIndex - 1]}.`
        : `O indicador ficou estável em relação a ${config.years[currentIndex - 1]}.`;

  const renderDashboardFilters = () => <div className="mb-4 space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/80 p-3">
    <div><div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">1. Escolha o ano</span><span className="text-[10px] text-cyan-300">Ano ativo: {filterYear}</span></div><div className="grid grid-cols-5 gap-1.5">{config.years.map(year => <button key={year} type="button" aria-pressed={filterYear === year} onClick={() => { setFilterYear(year); if (year !== config.years.at(-1)) setTestedAnotherYear(true); }} className={`rounded-lg border px-1 py-2 text-[10px] font-black transition-all ${filterYear === year ? 'border-cyan-300 bg-cyan-400 text-slate-950 shadow-[0_0_14px_rgba(34,211,238,.25)]' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-cyan-700'}`}>{year}</button>)}</div></div>
    <div><div className="mb-2 flex items-center justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">2. Escolha o território</span><span className="text-[10px] text-violet-300">{placeLabel}</span></div><div className="flex flex-wrap gap-1.5"><button type="button" aria-pressed={selectedTerritory === 'all'} onClick={() => setSelectedTerritory('all')} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${selectedTerritory === 'all' ? 'border-violet-300 bg-violet-500 text-white' : 'border-slate-700 bg-slate-950 text-slate-300'}`}>Município</button>{config.territories.map(item => <button key={item.name} type="button" aria-pressed={selectedTerritory === item.name} onClick={() => { setSelectedTerritory(item.name); setTestedTerritory(true); }} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${selectedTerritory === item.name ? 'border-violet-300 bg-violet-500 text-white' : 'border-slate-700 bg-slate-950 text-slate-300'}`}>{item.name}</button>)}</div></div>
  </div>;

  const renderDashboardPreview = () => <div className={`rounded-2xl border p-4 shadow-2xl transition-colors ${dashboardMode === 'technical' ? 'border-cyan-800 bg-slate-950' : 'border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 text-slate-900'}`}>
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2"><div><div className={`text-[9px] font-black uppercase tracking-widest ${dashboardMode === 'technical' ? 'text-cyan-400' : 'text-emerald-700'}`}>{dashboardMode === 'technical' ? 'Painel de vigilância • leitura técnica' : 'Saúde do município • leitura para todos'}</div><div className={`mt-1 font-black ${dashboardMode === 'technical' ? 'text-sm text-white' : 'text-xl text-slate-900'}`}>{dashboardMode === 'technical' ? config.indicator : `Entenda ${config.problem}`}</div></div><div className={`rounded-full px-3 py-1 text-[10px] font-black ${dashboardMode === 'technical' ? 'bg-cyan-950 text-cyan-200' : 'bg-emerald-600 text-white'}`}>{dashboardMode === 'technical' ? 'DADOS E MÉTODO' : 'LINGUAGEM SIMPLES'}</div></div>
    {renderDashboardFilters()}
    <div key={`${filterYear}-${selectedTerritory}-${dashboardMode}`} role="status" aria-live="polite" className={`mb-3 rounded-xl border px-3 py-2 text-[10px] font-black animate-in fade-in ${dashboardMode === 'technical' ? 'border-cyan-800 bg-cyan-950/40 text-cyan-200' : 'border-emerald-300 bg-emerald-100 text-emerald-900'}`}>✓ Painel atualizado: {filterYear} • {placeLabel} • modo {dashboardMode === 'technical' ? 'técnico' : 'cidadão'}</div>

    {dashboardMode === 'technical' ? <>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.includes('current') && <Metric label={`${placeLabel} • ${filterYear}`} value={`${formatValue(currentValue)} ${config.unit}`}/>}
        {dashboardCards.includes('baseline') && <Metric label="Linha de base da meta" value={config.baseline}/>}
        {dashboardCards.includes('target') && <Metric label="Meta pactuada para 2029" value={`${formatValue(config.targetValue)} ${config.unit}`} tone="emerald"/>}
        {dashboardCards.includes('quality') && <Metric label={`Completude em ${filterYear}`} value={`${dataCompleteness}% — ${dataCompleteness < 80 ? 'qualificar antes de concluir' : 'acompanhar inconsistências'}`} tone="amber"/>}
        {dashboardCards.includes('territory') && <Metric label={`Maior valor territorial em ${filterYear}`} value={`${priorityTerritory?.name}: ${formatValue(maxTerritory)} ${config.unit}`} tone="amber"/>}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl bg-slate-900 p-3"><div className="mb-1 flex items-center justify-between text-[10px] font-bold text-slate-400"><span>SÉRIE TEMPORAL • {placeLabel.toUpperCase()}</span><span className="text-cyan-300">{filterYear}: {formatValue(currentValue)}</span></div>{chartChoice === 'line' ? <svg viewBox="0 0 310 132" className="h-36 w-full" role="img" aria-label={`Série temporal de ${config.indicator}`}><polyline points={linePoints} fill="none" stroke="#22d3ee" strokeWidth="4"/><line x1="18" x2="292" y1="108" y2="108" stroke="#475569"/>{selectedSeries.map((value, index) => { const pointY = Number(linePoints.split(' ')[index].split(',')[1]); const active = index === currentIndex; return <g key={config.years[index]}><circle cx={22 + index * 66} cy={pointY} r={active ? 7 : 4} fill={active ? '#facc15' : '#a5f3fc'} stroke={active ? '#fff' : 'none'} strokeWidth="2"/><text x={22 + index * 66} y="126" textAnchor="middle" fill={active ? '#fde047' : '#94a3b8'} fontSize="9">{config.years[index]}</text></g>; })}</svg> : <div className="flex h-36 items-center justify-center text-xs text-slate-600">Escolha o gráfico de linhas para visualizar a série</div>}</div>
        <div className="rounded-xl bg-slate-900 p-3"><div className="mb-2 flex items-center justify-between text-[10px] font-bold text-slate-400"><span>COMPARAÇÃO TERRITORIAL</span><span className="text-violet-300">{filterYear}</span></div>{comparisonChoice === 'bar' ? <div className="space-y-3">{yearTerritories.map(item => <button type="button" key={item.name} onClick={() => { setSelectedTerritory(item.name); setTestedTerritory(true); }} className={`block w-full rounded-lg p-1.5 text-left transition-colors ${selectedTerritory === item.name ? 'bg-violet-950 ring-1 ring-violet-400' : 'hover:bg-slate-800'}`}><div className="mb-1 flex justify-between text-[10px] text-slate-300"><span>{item.name}</span><span>{formatValue(item.value)}</span></div><div className="h-3 rounded bg-slate-800"><div className="h-3 rounded bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${Math.max(12, item.value / maxTerritory * 100)}%` }}/></div></button>)}</div> : <div className="flex h-36 items-center justify-center text-xs text-slate-600">Escolha barras na mesma escala para comparar territórios</div>}</div>
      </div>
      <div className="mt-3 grid gap-2 text-[10px] leading-relaxed text-slate-300 sm:grid-cols-2"><div className="rounded-xl border border-slate-800 bg-slate-900 p-3"><strong className="text-cyan-300">Definição:</strong> {config.indicator}. Denominador: {denominator || 'ainda não selecionado'}.</div><div className="rounded-xl border border-slate-800 bg-slate-900 p-3"><strong className="text-amber-300">Relação com a meta:</strong> {isHistorical ? `comparação histórica; a meta foi pactuada a partir da linha de base de 2025.` : isAtTarget ? 'meta já alcançada no recorte selecionado.' : `${formatValue(distanceToTarget)} ${config.unit} acima do valor-alvo.`}</div></div>
    </> : <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"><div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Situação em {filterYear}</div><div className="mt-2 text-3xl font-black text-slate-900">{formatValue(currentValue)}</div><div className="mt-1 text-xs text-slate-600">{config.unit} • {placeLabel}</div></div>
        <div className={`rounded-2xl border p-5 shadow-sm ${isAtTarget ? 'border-emerald-300 bg-emerald-100' : trendPercent <= 0 ? 'border-blue-200 bg-blue-50' : 'border-amber-300 bg-amber-50'}`}><div className="flex items-center gap-2">{isAtTarget || trendPercent <= 0 ? <TrendingDown className={isAtTarget ? 'text-emerald-700' : 'text-blue-700'}/> : <TrendingUp className="text-amber-700"/>}<div className="font-black text-slate-900">{isAtTarget ? 'Meta alcançada neste recorte' : trendPercent < 0 ? 'O caminho melhorou' : currentIndex === 0 ? 'Ponto de partida' : 'Precisamos de mais atenção'}</div></div><p className="mt-2 text-xs leading-relaxed text-slate-700">{citizenTrend}</p></div>
      </div>
      <div className="mt-3 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-2"><div><div className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Onde a atenção é maior em {filterYear}</div><div className="mt-1 text-lg font-black text-slate-900">{priorityTerritory?.name}</div></div><div className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-900">{formatValue(maxTerritory)} {config.unit}</div></div><div className="mt-4 space-y-2">{yearTerritories.map(item => <button type="button" key={item.name} onClick={() => { setSelectedTerritory(item.name); setTestedTerritory(true); }} className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs ${selectedTerritory === item.name ? 'border-violet-400 bg-violet-50 text-violet-950' : 'border-slate-200 bg-slate-50 text-slate-700'}`}><span>{item.name}</span><span className="font-black">{formatValue(item.value)}</span></button>)}</div></div>
      <div className="mt-3 rounded-2xl bg-emerald-700 p-4 text-sm leading-relaxed text-white"><strong>O que a prefeitura pretende fazer:</strong> priorizar os territórios com maior necessidade, melhorar os registros e acompanhar os resultados. A meta para 2029 é chegar a no máximo <strong>{formatValue(config.targetValue)} {config.unit}</strong>.</div>
      <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-xs leading-relaxed text-cyan-950"><strong>Transparência:</strong> os dados de {filterYear} estão {dataCompleteness}% completos. Isso significa que ainda pode haver registros ausentes ou corrigidos depois.</div>
    </>}
  </div>;

  if (completed) return <div className="flex h-full flex-col overflow-y-auto bg-slate-950 text-white"><Header/><div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center p-4 md:p-8"><div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950 p-6 shadow-2xl md:p-9"><ClipboardCheck size={44} className="text-emerald-300"/><p className="mt-4 text-xs font-bold uppercase tracking-[.25em] text-emerald-300">Painel e nota técnica aprovados</p><h2 className="mt-2 text-2xl font-black md:text-4xl">Da evidência à decisão em saúde</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">{inputUser || 'Pesquisador(a)'}, você conectou análise epidemiológica, dashboard, causas, orçamento, cadeia lógica, meta e comunicação pública.</p><div className="mt-5 grid gap-3 md:grid-cols-3"><Metric label="Indicador" value={config.indicator}/><Metric label="Desempenho" value={`${score}%`} tone="emerald"/><Metric label="Produtos" value="Dashboard + nota técnica" tone="emerald"/></div><div className="mt-5 grid gap-3 lg:grid-cols-2">{renderDashboardPreview()}<div className="space-y-3"><div className="rounded-xl bg-white/5 p-4 text-xs leading-relaxed"><strong className="text-cyan-200">Ação</strong><div className="mt-1">{result.interventions.join(' + ')}</div></div><div className="rounded-xl bg-white/5 p-4 text-xs leading-relaxed"><strong className="text-cyan-200">Processo</strong><div className="mt-1">{config.processIndicator}</div></div><div className="rounded-xl bg-white/5 p-4 text-xs leading-relaxed"><strong className="text-cyan-200">Resultado → impacto</strong><div className="mt-1">{config.resultStatement} → {config.impactStatement}</div></div></div></div><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button onClick={() => onComplete(result)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-emerald-950 hover:bg-emerald-400"><ShieldCheck size={18}/> Salvar os dois produtos e concluir</button><button onClick={restartModule} className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold"><RotateCcw size={16}/> Refazer</button></div></div></div></div>;

  return <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-white"><Header/><div className="flex-1 overflow-y-auto"><main className="mx-auto w-full max-w-6xl p-4 md:p-7">
    {stage === 0 && <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><section className="rounded-3xl border border-cyan-800/60 bg-gradient-to-br from-cyan-950/80 to-slate-900 p-6 md:p-8"><div className="flex items-center gap-3 text-cyan-300"><MapPinned/><span className="text-xs font-bold uppercase tracking-widest">Convocação extraordinária</span></div><h2 className="mt-5 text-2xl font-black md:text-4xl">Seu artigo chamou a atenção da gestão municipal.</h2><p className="mt-4 text-sm leading-7 text-slate-300">A Secretaria de Saúde precisa transformar o achado sobre <strong className="text-white">{config.problem}</strong> em um painel e um plano responsável, viável e monitorável.</p><div className="mt-5 rounded-2xl border border-amber-700/50 bg-amber-950/30 p-4 text-xs leading-relaxed text-amber-100"><strong>Regra de ouro:</strong> o dashboard não é decoração. Cada elemento precisa responder a uma decisão: onde agir, qual meta perseguir, se os dados são confiáveis e se a estratégia está funcionando.</div><button onClick={() => setStage(1)} className="mt-7 flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950">Aceitar missão <ArrowRight size={18}/></button></section><aside className="space-y-4"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><BookOpen className="text-violet-300"/><h3 className="mt-3 font-bold">Você vai construir</h3><ul className="mt-3 space-y-2 text-xs text-slate-400"><li>• Dashboard técnico e cidadão</li><li>• SWOT/FOFA e Ishikawa 6M completo</li><li>• Prioridade GUT e orçamento</li><li>• Ação → processo → resultado → impacto</li><li>• Meta SMART e comunicação pública</li></ul></div><div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4"><div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Fonte oficial conferida</div><a href="https://www.gov.br/saude/pt-br/se/superintendencia-ba/publicacoes/publicacoes" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-between gap-3 text-xs font-bold text-emerald-100 hover:underline">Abrir publicações do Ministério da Saúde <ExternalLink size={15}/></a><a href="https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/guias-e-manuais/2025/guia-pratico-de-elaboracao-de-plano-municipal-de-saude-2026-2029.pdf/@@download/file/Guia%20Pr%C3%A1tico%20de%20Elabora%C3%A7%C3%A3o%20de%20Plano%20Municipal%20de%20Sa%C3%BAde%202026-2029.pdf" target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center justify-between gap-3 border-t border-emerald-800 pt-3 text-xs font-bold text-emerald-200 hover:underline">Baixar o guia 2026–2029 em PDF <ExternalLink size={15}/></a></div></aside></div>}
    {stage === 1 && <div className="space-y-5"><section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center gap-2 text-cyan-300"><Gauge/><h2 className="font-black">Diagnóstico situacional</h2></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Metric label={config.indicator} value={config.baseline}/><Metric label="Completude" value="82% — requer qualificação" tone="amber"/><Metric label="Cobertura da APS" value="76% da população" tone="emerald"/></div></section><ChoiceBlock title="Qual problema deve ser priorizado?" value={priority} onChange={setPriority} options={[["main", config.problem], ["records", "Somente a baixa completude, ignorando o desfecho"], ["aps", "A cobertura da APS isolada, sem relação com o problema"]]}/><ChoiceBlock title="Qual conclusão respeita o desenho ecológico?" value={interpretation} onChange={setInterpretation} options={[["cause", "O indicador comprova uma causa individual única."], ["trend", "Há um padrão populacional relevante; causas e desigualdades ainda precisam ser investigadas."], ["ignore", "Dados secundários não têm utilidade para a gestão."]]}/></div>}
    {stage === 2 && <div className="grid gap-5 xl:grid-cols-[.72fr_1.28fr]"><section className="space-y-4"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center gap-2 text-cyan-300"><LayoutDashboard/><h2 className="font-black">Monte o dashboard decisório</h2></div><p className="mt-2 text-xs leading-relaxed text-slate-400">Selecione tudo o que a equipe precisa para decidir e prestar contas à população.</p><div className="mt-4 grid grid-cols-2 gap-2">{DASHBOARD_CARDS.map(([id, label]) => <button key={id} onClick={() => toggleCard(id)} className={`rounded-xl border p-3 text-left text-xs font-bold ${dashboardCards.includes(id) ? 'border-cyan-400 bg-cyan-950 text-cyan-100' : 'border-slate-700 bg-slate-950 text-slate-400'}`}>{dashboardCards.includes(id) ? '✓ ' : '+ '}{label}</button>)}</div></div><ChoiceBlock title="Melhor gráfico para evolução temporal" value={chartChoice} onChange={setChartChoice} options={[["pie", "Gráfico de pizza"], ["line", "Gráfico de linhas"], ["icon", "Pictograma sem eixo temporal"]]}/><ChoiceBlock title="Melhor comparação entre territórios" value={comparisonChoice} onChange={setComparisonChoice} options={[["bar", "Barras na mesma escala"], ["pie", "Uma pizza para cada território"], ["none", "Não comparar territórios"]]}/><ChoiceBlock title="Denominador do indicador" value={denominator} onChange={setDenominator} options={[[config.denominator, config.denominator], ["visits", "Número de consultas realizadas"], ["all", "População total do Brasil"]]}/><div className="rounded-2xl border border-violet-800 bg-violet-950/25 p-4"><div className="text-[10px] font-black uppercase tracking-wider text-violet-300">Checklist de exploração</div><div className="mt-3 space-y-2 text-xs">{[[testedAnotherYear,'Comparou outro ano'],[testedTerritory,'Abriu um território'],[viewedCitizen,'Conferiu o modo cidadão']].map(([done,label]) => <div key={String(label)} className={`flex items-center gap-2 ${done ? 'text-emerald-300' : 'text-slate-400'}`}><span>{done ? '✓' : '○'}</span><span>{label}</span></div>)}</div></div></section><section className="space-y-3"><div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1"><button onClick={() => setDashboardMode('technical')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${dashboardMode === 'technical' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}>Modo técnico</button><button onClick={() => { setDashboardMode('citizen'); setViewedCitizen(true); }} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${dashboardMode === 'citizen' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>Modo cidadão</button></div>{renderDashboardPreview()}<div className="rounded-xl border border-violet-800 bg-violet-950/25 p-3 text-xs text-violet-100"><strong>Interaja com o painel:</strong> cada ano e território recalcula cartões, tendência, comparação, completude e texto explicativo.</div></section></div>}
    {stage === 3 && <div className="space-y-5"><div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-black text-cyan-200">SWOT/FOFA + Ishikawa completo</h2><p className="mt-2 text-xs leading-relaxed text-slate-400">O Ishikawa clássico usa os 6M. Aqui eles aparecem com uma tradução para saúde: Mão de obra/Pessoas, Método/Processos, Máquina/Tecnologia, Material/Insumos, Meio ambiente/Território e Medida/Mensuração.</p></div><div className="grid gap-3 lg:grid-cols-2">{CLASSIFICATION_ITEMS.map(item => <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="text-[9px] font-bold uppercase tracking-widest text-violet-300">{item.group}</div><p className="my-3 text-xs leading-relaxed text-slate-200">{item.text}</p><select value={classifications[item.id] || ''} onChange={event => setClassifications(previous => ({ ...previous, [item.id]: event.target.value }))} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs"><option value="">Classifique...</option>{item.group.startsWith('SWOT') ? ['Força','Fraqueza','Oportunidade','Ameaça'].map(option => <option key={option}>{option}</option>) : ['Mão de obra / Pessoas','Método / Processos','Máquina / Tecnologia','Material / Insumos','Meio ambiente / Território','Medida / Mensuração'].map(option => <option key={option}>{option}</option>)}</select></div>)}</div></div>}
    {stage === 4 && <div className="space-y-5"><ChoiceBlock title="Pela matriz GUT, qual problema recebe prioridade inicial?" value={gutPriority} onChange={setGutPriority} options={[["main", `${config.problem}: G5 × U4 × T5 = 100`], ["records", "Padronizar a cor de relatórios: G2 × U2 × T1 = 4"], ["parking", "Ampliar estacionamento administrativo: G2 × U1 × T2 = 4"]]}/><section><div className="mb-3 flex items-end justify-between"><div><h2 className="font-black text-cyan-200">Escolha o pacote de ações</h2><p className="text-xs text-slate-400">Orçamento máximo: 100 créditos. As consequências aparecem antes da confirmação.</p></div><div className={`text-xl font-black ${budget > 100 ? 'text-red-400' : 'text-emerald-300'}`}>{budget}/100</div></div><div className="grid gap-3 md:grid-cols-2">{INTERVENTIONS.map(item => <button key={item.id} onClick={() => toggleIntervention(item.id)} className={`rounded-2xl border p-4 text-left ${selectedInterventions.includes(item.id) ? item.good ? 'border-emerald-500 bg-emerald-950/35' : 'border-amber-500 bg-amber-950/35' : 'border-slate-800 bg-slate-900'}`}><div className="flex justify-between gap-3"><strong className="text-sm">{item.title}</strong><span className="text-xs font-black text-cyan-300">{item.cost}</span></div><p className="mt-2 text-xs leading-relaxed text-slate-400">{item.description}</p>{selectedInterventions.includes(item.id) && <div className="mt-3 rounded-lg bg-black/20 p-2 text-[11px] leading-relaxed text-amber-100"><strong>Consequência:</strong> {item.consequence}</div>}</button>)}</div></section></div>}
    {stage === 5 && <div className="space-y-5"><div className="rounded-2xl border border-cyan-800 bg-cyan-950/25 p-5"><h2 className="font-black text-cyan-100">Construa a cadeia lógica</h2><p className="mt-2 text-xs leading-relaxed text-slate-300"><strong>Ação</strong> é o que a equipe fará; <strong>processo</strong> mostra se foi executado; <strong>resultado</strong> revela a mudança mais próxima; <strong>impacto</strong> é o efeito populacional de longo prazo.</p><div className="mt-4 rounded-xl bg-slate-950 p-3 text-xs text-cyan-200">Ação escolhida: {result.interventions.join(' + ')}</div></div><ChoiceBlock title="1. Indicador de processo" value={processIndicator} onChange={setProcessIndicator} options={[[config.processIndicator, config.processIndicator], [config.impactStatement, config.impactStatement], ["meetings", "Número de reuniões, sem relação com execução territorial"]]}/><ChoiceBlock title="2. Resultado esperado" value={resultStatement} onChange={setResultStatement} options={[[config.resultStatement, config.resultStatement], ["publication", "Publicação imediata de um artigo internacional"], ["causal", "Prova definitiva de uma causa única"]]}/><ChoiceBlock title="3. Impacto esperado" value={impactStatement} onChange={setImpactStatement} options={[[config.impactStatement, config.impactStatement], ["instant", "Eliminar completamente o problema no primeiro mês"], ["process", config.processIndicator]]}/></div>}
    {stage === 6 && <div className="space-y-5"><ChoiceBlock title="Qual meta é realmente SMART?" value={goal} onChange={setGoal} options={[[config.smartGoal, config.smartGoal], ["improve", "Melhorar bastante o indicador futuramente."], ["zero", "Zerar imediatamente todos os casos."]]}/><ChoiceBlock title="Como monitorar sem esperar o fim do plano?" value={monitoring} onChange={setMonitoring} options={[["annual", "Ver somente o impacto ao final de quatro anos."], ["monthly-quarterly", "Acompanhar processo mensalmente, resultado trimestralmente e revisar a estratégia no PDCA."], ["none", "Executar as ações sem indicadores."]]}/><ChoiceBlock title="Qual mensagem é adequada à população?" value={publicMessage} onChange={setPublicMessage} options={[[config.publicMessage, config.publicMessage], ["blame", "A população é culpada pelo indicador e deve mudar."], ["certainty", "A pesquisa provou a causa e o plano eliminará o problema."]]}/></div>}
    {stage > 0 && <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"><button onClick={validateStage} disabled={Boolean(feedback?.ok)} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50">Validar e avançar <ArrowRight size={17}/></button><div className="text-xs text-slate-500">Etapa {stage} de 6 • {score}% de desempenho</div></div>}
    {feedback && <div className={`mt-4 flex items-start gap-3 rounded-xl border p-4 text-xs leading-relaxed ${feedback.ok ? 'border-emerald-700 bg-emerald-950/40 text-emerald-100' : 'border-red-700 bg-red-950/40 text-red-100'}`}>{feedback.ok ? <CheckCircle2 className="shrink-0 text-emerald-400" size={18}/> : <XCircle className="shrink-0 text-red-400" size={18}/>}<div>{feedback.text}</div></div>}
  </main></div></div>;
};
