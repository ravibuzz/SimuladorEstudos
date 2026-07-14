import React, { useMemo, useState } from 'react';
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, BookOpen, BrainCircuit,
  CheckCircle2, ChevronRight, ClipboardCheck, ExternalLink, Fish,
  Gauge, HeartHandshake, LayoutDashboard, Lightbulb, MapPinned,
  PiggyBank, RotateCcw, ShieldCheck, Sparkles, Target, Users, XCircle
} from 'lucide-react';
import { Scenario } from '../../types';

interface HealthManagementProps {
  currentScenario: Scenario | null;
  inputUser?: string;
  onComplete: (score: number) => void;
  onMistake?: () => void;
}

type CaseConfig = {
  city: string;
  problem: string;
  indicator: string;
  unit: string;
  years: number[];
  values: number[];
  baseline: string;
  priorityOption: string;
  denominator: string;
  smartGoal: string;
  publicMessage: string;
  interventionIds: string[];
};

const CASES: Record<string, CaseConfig> = {
  dengue_sp: {
    city: 'Município de Santa Aurora (SP)',
    problem: 'crescimento persistente da incidência de dengue',
    indicator: 'Incidência de dengue por 100 mil habitantes',
    unit: 'por 100 mil hab.',
    years: [2021, 2022, 2023, 2024, 2025],
    values: [185, 212, 281, 365, 410],
    baseline: '410 casos por 100 mil habitantes em 2025',
    priorityOption: 'dengue',
    denominator: 'População residente no município no mesmo período',
    smartGoal: 'Reduzir a incidência de dengue de 410 para no máximo 328 casos por 100 mil habitantes até dezembro de 2029.',
    publicMessage: 'A dengue aumentou nos últimos anos. O município vai agir nos territórios mais afetados e acompanhar a incidência regularmente.',
    interventionIds: ['territory', 'surveillance']
  },
  infant_mortality: {
    city: 'Município de Boa Esperança (MA)',
    problem: 'mortalidade infantil acima da meta municipal',
    indicator: 'Coeficiente de mortalidade infantil',
    unit: 'por mil nascidos vivos',
    years: [2021, 2022, 2023, 2024, 2025],
    values: [15.8, 15.2, 15.5, 14.9, 14.7],
    baseline: '14,7 óbitos menores de um ano por mil nascidos vivos em 2025',
    priorityOption: 'infant',
    denominator: 'Nascidos vivos de mães residentes no mesmo período',
    smartGoal: 'Reduzir o coeficiente de mortalidade infantil de 14,7 para no máximo 12,5 por mil nascidos vivos até dezembro de 2029.',
    publicMessage: 'A mortalidade infantil apresentou pequena redução, mas permanece prioritária. O plano reforçará pré-natal, puerpério e cuidado ao recém-nascido.',
    interventionIds: ['territory', 'surveillance']
  },
  tb_aids: {
    city: 'Município de Vale Verde (SP)',
    problem: 'aumento da proporção de coinfecção tuberculose-HIV',
    indicator: 'Proporção de casos novos de tuberculose com coinfecção HIV',
    unit: '% dos casos novos de TB',
    years: [2021, 2022, 2023, 2024, 2025],
    values: [9.8, 10.4, 10.9, 11.7, 12.4],
    baseline: '12,4% dos casos novos de tuberculose em 2025',
    priorityOption: 'tbhiv',
    denominator: 'Total de casos novos de tuberculose no mesmo local e período',
    smartGoal: 'Reduzir a proporção de coinfecção TB-HIV de 12,4% para no máximo 10,5% até dezembro de 2029.',
    publicMessage: 'A coinfecção TB-HIV aumentou. O município ampliará testagem, integração do cuidado e acompanhamento sem culpabilizar as pessoas afetadas.',
    interventionIds: ['territory', 'surveillance']
  },
  asthma_poluicao: {
    city: 'Município de Horizonte Azul (SP)',
    problem: 'crescimento das internações por asma',
    indicator: 'Taxa de internação por asma',
    unit: 'por 10 mil hab.',
    years: [2021, 2022, 2023, 2024, 2025],
    values: [22, 24, 23, 28, 31],
    baseline: '31 internações por 10 mil habitantes em 2025',
    priorityOption: 'asthma',
    denominator: 'População residente na faixa etária definida, no mesmo período',
    smartGoal: 'Reduzir a taxa de internação por asma de 31 para no máximo 26 por 10 mil habitantes até dezembro de 2029.',
    publicMessage: 'As internações por asma cresceram. O município reforçará o cuidado na atenção primária e investigará fatores ambientais e de acesso.',
    interventionIds: ['territory', 'surveillance']
  }
};

const classificationItems = [
  { id: 'team', text: 'Equipe de atenção primária experiente e com baixa rotatividade', correct: 'Força', group: 'SWOT' },
  { id: 'records', text: 'Cadastros territoriais incompletos e prontuários pouco integrados', correct: 'Fraqueza', group: 'SWOT' },
  { id: 'university', text: 'Universidade local oferece parceria para qualificar a análise de dados', correct: 'Oportunidade', group: 'SWOT' },
  { id: 'budget', text: 'Possibilidade de redução de repasses no próximo exercício', correct: 'Ameaça', group: 'SWOT' },
  { id: 'turnover', text: 'Rotatividade e treinamento insuficiente dos profissionais', correct: 'Pessoas', group: 'Ishikawa' },
  { id: 'protocol', text: 'Busca ativa sem fluxo, responsável ou protocolo definidos', correct: 'Processos', group: 'Ishikawa' },
  { id: 'system', text: 'Sistemas de informação que não trocam dados entre si', correct: 'Tecnologia', group: 'Ishikawa' },
  { id: 'transport', text: 'Barreiras de transporte e distância até os serviços', correct: 'Território', group: 'Ishikawa' }
];

const interventions = [
  { id: 'territory', title: 'Ação territorial integrada', cost: 60, description: 'Estratificação de risco, busca ativa e cuidado coordenado nos territórios prioritários.' },
  { id: 'surveillance', title: 'Vigilância e qualidade do dado', cost: 40, description: 'Qualificar registro, denominadores, oportunidade da notificação e monitoramento mensal.' },
  { id: 'campaign', title: 'Campanha genérica de mídia', cost: 55, description: 'Peças de comunicação sem segmentação territorial nem avaliação definida.' },
  { id: 'equipment', title: 'Compra isolada de equipamento', cost: 70, description: 'Aquisição sem diagnóstico do gargalo, plano de uso ou equipe responsável.' }
];

const stageLabels = ['Convocação', 'Diagnóstico', 'Indicador', 'Causas', 'Plano', 'Monitoramento'];

export const HealthManagement: React.FC<HealthManagementProps> = ({ currentScenario, inputUser, onComplete, onMistake }) => {
  const config = CASES[currentScenario?.id || ''] || CASES.dengue_sp;
  const [stage, setStage] = useState(0);
  const [priority, setPriority] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [chartChoice, setChartChoice] = useState('');
  const [denominator, setDenominator] = useState('');
  const [classifications, setClassifications] = useState<Record<string, string>>({});
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  const [gutPriority, setGutPriority] = useState('');
  const [goal, setGoal] = useState('');
  const [monitoring, setMonitoring] = useState('');
  const [publicMessage, setPublicMessage] = useState('');
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [completed, setCompleted] = useState(false);

  const classificationScore = classificationItems.filter(item => classifications[item.id] === item.correct).length;
  const budget = selectedInterventions.reduce((sum, id) => sum + (interventions.find(item => item.id === id)?.cost || 0), 0);
  const score = Math.max(60, 100 - mistakes * 5);

  const linePoints = useMemo(() => {
    const min = Math.min(...config.values);
    const max = Math.max(...config.values);
    return config.values.map((value, index) => {
      const x = 24 + index * 66;
      const y = 104 - ((value - min) / Math.max(1, max - min)) * 72;
      return `${x},${y}`;
    }).join(' ');
  }, [config]);

  const fail = (text: string) => {
    setFeedback({ ok: false, text });
    setMistakes(value => value + 1);
    onMistake?.();
  };

  const advance = (text: string) => {
    setFeedback({ ok: true, text });
    window.setTimeout(() => {
      setFeedback(null);
      setStage(value => Math.min(5, value + 1));
    }, 900);
  };

  const validateStage = () => {
    if (stage === 1) {
      if (priority !== config.priorityOption || interpretation !== 'trend') {
        fail('Revise a magnitude, a evolução temporal e a linguagem da conclusão. Priorizar não é o mesmo que afirmar causalidade.');
        return;
      }
      advance('Diagnóstico aprovado: você priorizou um problema relevante sem ultrapassar o que os dados permitem concluir.');
    }
    if (stage === 2) {
      if (chartChoice !== 'line' || denominator !== config.denominator) {
        fail('Para acompanhar uma série temporal, use gráfico de linhas e um denominador coerente com a população sob risco.');
        return;
      }
      advance('Indicador validado: fonte, denominador, unidade e visualização estão coerentes.');
    }
    if (stage === 3) {
      if (classificationScore < classificationItems.length) {
        fail(`Você classificou ${classificationScore} de ${classificationItems.length} itens corretamente. Na SWOT, interno/externo e positivo/negativo importam; no Ishikawa, organize causas, não culpados.`);
        return;
      }
      advance('Análise sistêmica concluída: contexto estratégico e causas do problema foram separados corretamente.');
    }
    if (stage === 4) {
      const correctPackage = config.interventionIds.every(id => selectedInterventions.includes(id)) && selectedInterventions.length === config.interventionIds.length;
      if (gutPriority !== 'main' || budget > 100 || !correctPackage) {
        fail('A escolha precisa combinar prioridade GUT, impacto sobre causas modificáveis, monitoramento e orçamento de até 100 créditos.');
        return;
      }
      advance('Plano viável: você priorizou o problema e financiou ações complementares, com execução e mensuração.');
    }
    if (stage === 5) {
      if (goal !== config.smartGoal || monitoring !== 'monthly-quarterly' || publicMessage !== config.publicMessage) {
        fail('A meta deve trazer indicador, linha de base, valor-alvo e prazo. O monitoramento precisa combinar acompanhamento operacional e avaliação periódica, com comunicação clara.');
        return;
      }
      setFeedback({ ok: true, text: 'Missão concluída. Seu estudo agora sustenta um plano de ação monitorável e compreensível para a população.' });
      setCompleted(true);
    }
  };

  const restartModule = () => {
    setStage(0); setPriority(''); setInterpretation(''); setChartChoice(''); setDenominator('');
    setClassifications({}); setSelectedInterventions([]); setGutPriority(''); setGoal('');
    setMonitoring(''); setPublicMessage(''); setFeedback(null); setMistakes(0); setCompleted(false);
  };

  const Header = () => (
    <div className="shrink-0 border-b border-cyan-900/60 bg-slate-950 px-4 py-3 text-white md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-400/15 p-2 text-cyan-300"><Activity size={24}/></div>
          <div><h1 className="text-sm font-black tracking-wide md:text-base">SALA DE SITUAÇÃO SUS</h1><p className="text-[10px] text-cyan-200/70">EVIDÊNCIA • PLANEJAMENTO • DECISÃO</p></div>
        </div>
        <div className="rounded-full border border-cyan-800 bg-cyan-950/60 px-3 py-1 text-[10px] font-bold text-cyan-200">{config.city}</div>
      </div>
      <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
        {stageLabels.map((label, index) => (
          <div key={label} className={`min-w-[88px] flex-1 rounded-lg border px-2 py-1.5 text-center text-[9px] font-bold ${index < stage ? 'border-emerald-700 bg-emerald-950/50 text-emerald-300' : index === stage ? 'border-cyan-400 bg-cyan-400/15 text-cyan-100' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
            {index < stage ? '✓ ' : `${index + 1}. `}{label}
          </div>
        ))}
      </div>
    </div>
  );

  if (completed) {
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-slate-950 text-white">
        <Header/>
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center p-4 md:p-8">
          <div className="overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950 shadow-2xl">
            <div className="p-6 md:p-10">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400 text-emerald-950 shadow-lg"><ClipboardCheck size={34}/></div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300">Nota técnica aprovada</p>
              <h2 className="mt-2 text-2xl font-black md:text-4xl">Da evidência à decisão em saúde</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">{inputUser || 'Pesquisador(a)'}, você conectou análise epidemiológica, diagnóstico situacional, ferramentas de gestão, orçamento, meta e comunicação pública.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/5 p-4"><div className="text-xs text-slate-400">Indicador prioritário</div><div className="mt-1 text-sm font-bold text-cyan-200">{config.indicator}</div></div>
                <div className="rounded-2xl bg-white/5 p-4"><div className="text-xs text-slate-400">Linha de base</div><div className="mt-1 text-sm font-bold text-cyan-200">{config.baseline}</div></div>
                <div className="rounded-2xl bg-white/5 p-4"><div className="text-xs text-slate-400">Desempenho</div><div className="mt-1 text-3xl font-black text-emerald-300">{score}%</div></div>
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-800 bg-emerald-950/40 p-4 text-sm leading-relaxed text-emerald-100"><strong>Meta pactuada:</strong> {config.smartGoal}</div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => onComplete(score)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-emerald-950 hover:bg-emerald-400"><ShieldCheck size={18}/> Registrar produto técnico e concluir</button>
                <button onClick={restartModule} className="flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-white/5"><RotateCcw size={16}/> Refazer missão</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-950 text-white">
      <Header/>
      <div className="flex-1 overflow-y-auto">
        <main className="mx-auto w-full max-w-5xl p-4 md:p-7">
          {stage === 0 && (
            <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
              <section className="rounded-3xl border border-cyan-800/60 bg-gradient-to-br from-cyan-950/80 to-slate-900 p-6 md:p-8">
                <div className="flex items-center gap-3 text-cyan-300"><MapPinned/><span className="text-xs font-bold uppercase tracking-widest">Convocação extraordinária</span></div>
                <h2 className="mt-5 text-2xl font-black leading-tight md:text-4xl">Seu artigo chamou a atenção da gestão municipal.</h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">A Secretaria de Saúde precisa revisar o Plano Municipal de Saúde. Sua missão é transformar o achado científico sobre <strong className="text-white">{config.problem}</strong> em uma decisão responsável, viável e monitorável.</p>
                <div className="mt-6 rounded-2xl border border-amber-700/50 bg-amber-950/30 p-4 text-xs leading-relaxed text-amber-100"><strong>Regra de ouro:</strong> dados orientam a decisão, mas não decidem sozinhos. Qualidade da informação, contexto, equidade, recursos e participação social também importam.</div>
                <button onClick={() => setStage(1)} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-black text-slate-950 hover:bg-cyan-300 sm:w-auto">Aceitar missão <ArrowRight size={18}/></button>
              </section>
              <aside className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><BookOpen className="text-violet-300"/><h3 className="mt-3 font-bold">O que você vai praticar</h3><ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-400"><li>• Plano Municipal e análise situacional</li><li>• Indicadores e dashboard</li><li>• SWOT/FOFA, Ishikawa e GUT</li><li>• Orçamento, meta SMART e monitoramento</li><li>• Comunicação acessível à população</li></ul></div>
                <a href="https://www.gov.br/saude/pt-br/centrais-de-conteudo/publicacoes/guias-e-manuais/2025/guia-pratico-de-elaboracao-de-plano-municipal-de-saude-2026-2029.pdf" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4 text-xs font-bold text-emerald-200 hover:bg-emerald-950/60">Guia oficial do Ministério da Saúde <ExternalLink size={15}/></a>
              </aside>
            </div>
          )}

          {stage === 1 && (
            <div className="space-y-5">
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6"><div className="flex items-center gap-2 text-cyan-300"><Gauge/><h2 className="font-black">1. Diagnóstico situacional</h2></div><p className="mt-2 text-sm text-slate-400">Leia o recorte do plano e escolha a interpretação mais defensável.</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><Metric label={config.indicator} value={config.baseline} tone="cyan"/><Metric label="Completude dos registros" value="82% — requer qualificação" tone="amber"/><Metric label="Cobertura da APS" value="76% da população" tone="emerald"/></div></section>
              <ChoiceBlock title="Qual problema deve ser priorizado nesta missão?" value={priority} onChange={setPriority} options={[
                [config.priorityOption, config.problem], ['records', 'Apenas a baixa completude dos registros, ignorando o desfecho'], ['aps', 'A cobertura da APS isoladamente, sem relacioná-la ao problema']
              ]}/>
              <ChoiceBlock title="Qual conclusão respeita o desenho e os dados?" value={interpretation} onChange={setInterpretation} options={[
                ['cause', 'O indicador comprova que uma única causa produziu o problema em cada indivíduo.'], ['trend', 'Há um padrão populacional relevante para planejamento; causas e desigualdades devem ser investigadas antes de concluir causalidade.'], ['ignore', 'Como são dados secundários, o indicador não tem utilidade para a gestão.']
              ]}/>
            </div>
          )}

          {stage === 2 && (
            <div className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 md:p-6"><div className="flex items-center gap-2 text-cyan-300"><LayoutDashboard/><h2 className="font-black">2. Arquitetura do indicador</h2></div><div className="mt-5 rounded-2xl bg-slate-950 p-4"><div className="flex items-end justify-between"><div><div className="text-xs text-slate-500">{config.indicator}</div><div className="text-2xl font-black text-white">{config.values.at(-1)} <span className="text-xs font-normal text-slate-400">{config.unit}</span></div></div><div className="text-xs font-bold text-amber-300">Série simulada</div></div><svg viewBox="0 0 320 130" className="mt-4 h-40 w-full" role="img" aria-label={`Série temporal de ${config.indicator}`}><line x1="20" y1="110" x2="300" y2="110" stroke="#334155"/><line x1="20" y1="20" x2="20" y2="110" stroke="#334155"/><polyline points={linePoints} fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>{config.values.map((value, index) => <g key={config.years[index]}><circle cx={24 + index * 66} cy={104 - ((value - Math.min(...config.values)) / Math.max(1, Math.max(...config.values) - Math.min(...config.values))) * 72} r="5" fill="#0f172a" stroke="#67e8f9" strokeWidth="3"/><text x={24 + index * 66} y="126" textAnchor="middle" fill="#94a3b8" fontSize="9">{config.years[index]}</text></g>)}</svg></div></section>
              <div className="space-y-4"><ChoiceBlock title="Melhor gráfico para acompanhar a evolução anual" value={chartChoice} onChange={setChartChoice} options={[[ 'pie', 'Pizza, porque mostra partes de um total ao longo do tempo'], ['line', 'Linha, porque preserva a ordem temporal e evidencia tendências'], ['map', 'Mapa sem escala temporal, porque substitui a série histórica']]}/><ChoiceBlock title="Denominador coerente" value={denominator} onChange={setDenominator} options={[[config.denominator, config.denominator], ['População total do Brasil, independentemente do território', 'População total do Brasil'], ['Número total de atendimentos da unidade escolhida', 'Atendimentos de uma única unidade']]}/></div>
            </div>
          )}

          {stage === 3 && (
            <div className="space-y-5"><section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center gap-2 text-cyan-300"><BrainCircuit/><h2 className="font-black">3. Laboratório de causas e contexto</h2></div><p className="mt-2 text-sm text-slate-400">Classifique os oito elementos. SWOT situa fatores internos/externos; Ishikawa organiza causas potenciais para investigação.</p><div className="mt-3 flex gap-3 text-xs"><span className="rounded-full bg-violet-950 px-3 py-1 text-violet-200">SWOT/FOFA</span><span className="rounded-full bg-cyan-950 px-3 py-1 text-cyan-200">Ishikawa adaptado à saúde</span><span className="ml-auto font-bold text-slate-400">{classificationScore}/{classificationItems.length}</span></div></section><div className="grid gap-3 md:grid-cols-2">{classificationItems.map(item => <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="mb-3 flex items-start gap-3"><div className={`rounded-lg p-2 ${item.group === 'SWOT' ? 'bg-violet-950 text-violet-300' : 'bg-cyan-950 text-cyan-300'}`}>{item.group === 'SWOT' ? <Target size={17}/> : <Fish size={17}/>}</div><div><div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">{item.group}</div><p className="mt-1 text-xs leading-relaxed text-slate-200">{item.text}</p></div></div><select value={classifications[item.id] || ''} onChange={event => setClassifications(previous => ({...previous, [item.id]: event.target.value}))} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-xs text-white"><option value="">Classifique...</option>{(item.group === 'SWOT' ? ['Força','Fraqueza','Oportunidade','Ameaça'] : ['Pessoas','Processos','Tecnologia','Território']).map(option => <option key={option}>{option}</option>)}</select></div>)}</div></div>
          )}

          {stage === 4 && (
            <div className="space-y-5"><section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center gap-2 text-cyan-300"><PiggyBank/><h2 className="font-black">4. Prioridade e orçamento</h2></div><p className="mt-2 text-sm text-slate-400">A matriz GUT combina Gravidade × Urgência × Tendência. Depois, financie exatamente duas ações dentro de 100 créditos.</p></section><div className="overflow-x-auto rounded-2xl border border-slate-800"><table className="w-full min-w-[580px] bg-slate-900 text-xs"><thead className="bg-slate-800 text-slate-300"><tr><th className="p-3 text-left">Problema</th><th>G</th><th>U</th><th>T</th><th>Produto</th><th className="p-3">Priorizar</th></tr></thead><tbody className="divide-y divide-slate-800"><GutRow label={config.problem} values={[5,5,4]} id="main" selected={gutPriority} setSelected={setGutPriority}/><GutRow label="Layout desatualizado do boletim interno" values={[2,2,2]} id="layout" selected={gutPriority} setSelected={setGutPriority}/><GutRow label="Baixa participação em uma reunião administrativa" values={[2,3,2]} id="meeting" selected={gutPriority} setSelected={setGutPriority}/></tbody></table></div><div><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">Carteira de intervenções</h3><span className={`rounded-full px-3 py-1 text-xs font-black ${budget > 100 ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'}`}>{budget}/100 créditos</span></div><div className="grid gap-3 md:grid-cols-2">{interventions.map(item => { const selected = selectedInterventions.includes(item.id); return <button key={item.id} onClick={() => setSelectedInterventions(previous => selected ? previous.filter(id => id !== item.id) : [...previous, item.id])} className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-cyan-400 bg-cyan-950/60' : 'border-slate-800 bg-slate-900 hover:border-slate-600'}`}><div className="flex items-center justify-between"><span className="font-bold text-white">{item.title}</span><span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-bold text-cyan-300">{item.cost}</span></div><p className="mt-2 text-xs leading-relaxed text-slate-400">{item.description}</p></button>})}</div></div></div>
          )}

          {stage === 5 && (
            <div className="space-y-5"><section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><div className="flex items-center gap-2 text-cyan-300"><Target/><h2 className="font-black">5. Meta, monitoramento e transparência</h2></div><p className="mt-2 text-sm text-slate-400">Feche a cadeia lógica: linha de base → ação → indicador → meta → acompanhamento → comunicação.</p></section><ChoiceBlock title="Qual meta é realmente SMART?" value={goal} onChange={setGoal} options={[[ 'improve', 'Melhorar bastante a saúde da população assim que possível.'], [config.smartGoal, config.smartGoal], ['zero', 'Eliminar completamente o problema em todos os indivíduos no próximo mês.']]}/><ChoiceBlock title="Plano de monitoramento" value={monitoring} onChange={setMonitoring} options={[[ 'end', 'Avaliar apenas no fim dos quatro anos.'], ['daily', 'Cobrar resultado final diariamente, sem avaliar processo.'], ['monthly-quarterly', 'Acompanhar processo mensalmente e revisar resultado, desigualdades e qualidade dos dados a cada quadrimestre.']]}/><ChoiceBlock title="Mensagem pública mais responsável" value={publicMessage} onChange={setPublicMessage} options={[[ 'blame', 'A população é culpada pelo indicador e precisa mudar imediatamente.'], [config.publicMessage, config.publicMessage], ['certainty', 'Nosso estudo provou a única causa e garante que o plano resolverá o problema.']]}/></div>
          )}

          {stage > 0 && (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><button onClick={() => { setFeedback(null); setStage(value => Math.max(0, value - 1)); }} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800"><ArrowLeft size={15}/> Voltar</button><div className="flex-1">{feedback && <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${feedback.ok ? 'border-emerald-800 bg-emerald-950/40 text-emerald-200' : 'border-red-800 bg-red-950/40 text-red-200'}`}>{feedback.ok ? <CheckCircle2 className="shrink-0" size={17}/> : <XCircle className="shrink-0" size={17}/>}<span>{feedback.text}</span></div>}</div><button onClick={validateStage} disabled={Boolean(feedback?.ok)} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-xs font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50">Validar decisão <ChevronRight size={16}/></button></div></div>
          )}
        </main>
      </div>
    </div>
  );
};

const Metric = ({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'amber' | 'emerald' }) => <div className={`rounded-xl border p-4 ${tone === 'cyan' ? 'border-cyan-800 bg-cyan-950/30' : tone === 'amber' ? 'border-amber-800 bg-amber-950/30' : 'border-emerald-800 bg-emerald-950/30'}`}><div className="text-[10px] leading-tight text-slate-400">{label}</div><div className="mt-2 text-sm font-black text-white">{value}</div></div>;

const ChoiceBlock = ({ title, value, onChange, options }: { title: string; value: string; onChange: (value: string) => void; options: string[][] }) => <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><h3 className="text-sm font-bold text-white">{title}</h3><div className="mt-3 grid gap-2">{options.map(([optionValue, label]) => <label key={optionValue} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs leading-relaxed transition ${value === optionValue ? 'border-cyan-400 bg-cyan-950/50 text-cyan-100' : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'}`}><input type="radio" className="mt-0.5 accent-cyan-400" checked={value === optionValue} onChange={() => onChange(optionValue)}/><span>{label}</span></label>)}</div></section>;

const GutRow = ({ label, values, id, selected, setSelected }: { label: string; values: number[]; id: string; selected: string; setSelected: (id: string) => void }) => <tr><td className="p-3 text-slate-200">{label}</td>{values.map((value, index) => <td key={index} className="text-center font-bold text-slate-300">{value}</td>)}<td className="text-center font-black text-cyan-300">{values.reduce((product, value) => product * value, 1)}</td><td className="p-3 text-center"><input type="radio" name="gut" className="accent-cyan-400" checked={selected === id} onChange={() => setSelected(id)}/></td></tr>;
