
import React, { useEffect, useState } from 'react';
import { Save, Clipboard, FileText, AlertCircle, Lightbulb, ScanSearch, Loader2, CheckCircle, Printer, DownloadCloud, XCircle } from 'lucide-react';
import { ClipboardItem, VirtualFile, TabnetData, ArticleHit } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';

interface PaperWriterProps {
    clipboard: ClipboardItem | null;
    onSaveFile: (file: VirtualFile) => void;
    savedReferences: ArticleHit[];
    initialFile?: VirtualFile | null;
    onCloseDocument?: () => void;
}

interface Attachments {
    chart: any | null;
    table: any | null;
}

type Section = 'intro' | 'methods' | 'results' | 'discussion';

export const PaperWriter: React.FC<PaperWriterProps> = ({ clipboard, onSaveFile, savedReferences, initialFile, onCloseDocument }) => {
  const [activeSection, setActiveSection] = useState<Section>('intro');
  
  // Guided Inputs (Mad Libs Style)
  const [introExposure, setIntroExposure] = useState('');
  const [introOutcome, setIntroOutcome] = useState('');
  const [introPopulation, setIntroPopulation] = useState('');
  const [introJustification, setIntroJustification] = useState('');
  const [methodsSystem, setMethodsSystem] = useState('');
  const [methodsDesign, setMethodsDesign] = useState('');
  const [methodsPeriod, setMethodsPeriod] = useState('');
  const [methodsInclusion, setMethodsInclusion] = useState('');
  const [methodsSoftware, setMethodsSoftware] = useState('');
  const [methodsStats, setMethodsStats] = useState('');
  const [discussionConnector, setDiscussionConnector] = useState('');
  const [discussionRefId, setDiscussionRefId] = useState('');
  
  // New Advanced Fields
  const [resultPValue, setResultPValue] = useState('');
  const [resultCI, setResultCI] = useState('');
  const [discussionLimit, setDiscussionLimit] = useState('');
  const [publicHealthImpact, setPublicHealthImpact] = useState('');

  const [attachments, setAttachments] = useState<Attachments>({ chart: null, table: null });
  const [isSaving, setIsSaving] = useState(false);
  const [plagiarismCheck, setPlagiarismCheck] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [validationError, setValidationError] = useState<string[] | null>(null);
  
  // Toast Notification State
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [openedDocument, setOpenedDocument] = useState<VirtualFile | null>(null);

  useEffect(() => {
      if (initialFile?.type === 'doc') setOpenedDocument(initialFile);
  }, [initialFile?.id]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  const handlePaste = () => {
      if (clipboard) {
          if (clipboard.type === 'chart') {
              // Store the RAW CONFIG, don't try to store a component
              setAttachments(prev => ({ ...prev, chart: clipboard.data }));
              showToast("Gráfico colado nos Resultados com sucesso!", 'success');
          } else if (clipboard.type === 'table') {
              setAttachments(prev => ({ ...prev, table: clipboard.data }));
              showToast("Tabela colada nos Resultados com sucesso!", 'success');
          } else {
              showToast("Tipo de dado não suportado.", 'error');
          }
      } else {
          showToast("Área de transferência vazia. Copie algo no Pigxcel primeiro.", 'error');
      }
  };

  const validate = (): string[] => {
      const errors = [];
      if (!introExposure) errors.push("Introdução: Falta a variável de Exposição");
      if (!introOutcome) errors.push("Introdução: Falta a variável de Desfecho");
      if (!introPopulation) errors.push("Introdução: Falta definir a População/Local");
      if (!introJustification) errors.push("Introdução: Falta a justificativa do estudo");
      if (!methodsDesign) errors.push("Metodologia: Falta o Desenho de Estudo");
      if (!methodsSystem) errors.push("Metodologia: Falta o Sistema de Dados");
      if (!methodsPeriod) errors.push("Metodologia: Falta o Período");
      if (!methodsInclusion) errors.push("Metodologia: Falta os critérios de inclusão");
      if (!methodsSoftware) errors.push("Metodologia: Falta o software de análise");
      if (!methodsStats) errors.push("Metodologia: Falta o Teste Estatístico");
      if (!attachments.chart) errors.push("Resultados: Falta colar o Gráfico");
      if (!attachments.table) errors.push("Resultados: Falta colar a Tabela");
      if (!resultPValue) errors.push("Resultados: Falta interpretar o P-valor");
      if (!discussionRefId) errors.push("Discussão: Falta selecionar referência bibliográfica");
      if (!discussionConnector) errors.push("Discussão: Falta o conector de argumentação");
      if (!discussionLimit) errors.push("Discussão: Falta citar a limitação do estudo");
      if (!publicHealthImpact) errors.push("Conclusão: Falta propor intervenção em Saúde Pública");
      
      // Educational Validation
      if (methodsDesign && methodsDesign !== 'ecologico') {
          errors.push("Erro Metodológico: Desenho de estudo incorreto para dados agregados.");
      }

      return errors;
  }

  const handleSave = () => {
      setValidationError(null);
      const errors = validate();
      
      if (errors.length > 0) {
          setValidationError(errors);
          return;
      }

      setPlagiarismCheck(true);
      setTimeout(() => {
          setPlagiarismCheck(false);
          setIsSaving(true);
          
          // Create the file object but hold it
          setTimeout(() => {
             setIsSaving(false);
             setShowFullPreview(true);
          }, 1500);
      }, 2500);
  };

  const handleFinalize = () => {
      setShowFullPreview(false);
      setIsCompressing(true);

      const ref = savedReferences.find(r => r.id === discussionRefId);
      const ciInterpretation = resultCI === 'nao_inclui_zero'
          ? 'IC95% do coeficiente sem incluir 0, sugerindo evidência de correlação diferente de zero'
          : resultCI === 'inclui_zero'
              ? 'IC95% incluindo 0, portanto compatível com correlação nula'
              : 'IC95% não informado';
      const finalContent = `
            ESTUDO ECOLÓGICO
            INTRODUÇÃO: O presente estudo analisou a relação entre a variável de exposição (${introExposure}) e o desfecho (${introOutcome}) na população de ${introPopulation}. A justificativa baseia-se em: ${introJustification}.
            METODOLOGIA: Trata-se de um estudo ${methodsDesign}, utilizando dados agregados provenientes do sistema ${methodsSystem} no período de ${methodsPeriod}. Foram incluídos: ${methodsInclusion}. Os dados foram tabulados no software ${methodsSoftware}. Para análise estatística de correlação, utilizou-se o teste de ${methodsStats}.
            RESULTADOS: (Ver tabelas e gráficos em anexo). A interpretação do p-valor foi: ${resultPValue}. Quanto à precisão da correlação: ${ciInterpretation}.
            DISCUSSÃO: Nossos achados ${discussionConnector} com os resultados apresentados por ${ref?.authors.split(',')[0]} et al., que também investigaram a temática. Como principal limitação deste estudo, destaca-se que ${discussionLimit} (falácia ecológica).
            CONCLUSÃO: Recomenda-se a seguinte intervenção em Saúde Pública: ${publicHealthImpact}.
      `;
      
      setTimeout(() => {
          const newFile: VirtualFile = {
              id: Date.now().toString(),
              name: 'Artigo_Final_Versao1.doc',
              type: 'doc',
              folder: 'documents',
              content: { text: finalContent, attachment: attachments },
              createdAt: new Date()
          };
          onSaveFile(newFile);
          setIsCompressing(false);
      }, 2500); // 2.5s immersive save delay
  }

  const renderChart = (chartData: any) => {
      if (!chartData || !chartData.series) return null;
      return (
        <ResponsiveContainer width="100%" height="100%">
            {chartData.chartType === 'bar' ? (
                <BarChart data={chartData.series}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="name" hide/>
                    <YAxis/>
                    <Bar dataKey="value" fill="#333" isAnimationActive={false} />
                </BarChart>
            ) : (
                <LineChart data={chartData.series}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="name" hide/>
                    <YAxis/>
                    <Line type="monotone" dataKey="value" stroke="#333" strokeWidth={2} isAnimationActive={false} />
                </LineChart>
            )}
        </ResponsiveContainer>
      );
  };

  const renderSectionContent = () => {
      switch(activeSection) {
          case 'intro':
              return (
                  <div className="space-y-6 animate-in fade-in">
                      <h3 className="font-bold text-blue-900 border-b pb-2">1. Introdução (Complete as lacunas)</h3>
                      <div className="bg-slate-50 p-6 rounded border border-slate-200 leading-loose text-sm">
                          O presente estudo tem como objetivo analisar a correlação entre a variável de exposição 
                          <input 
                            value={introExposure} 
                            onChange={e=>setIntroExposure(e.target.value)} 
                            className={`mx-2 border-b-2 bg-transparent outline-none text-center font-bold text-blue-900 w-40 placeholder-blue-200 ${validationError && !introExposure ? 'border-red-500 bg-red-50' : 'border-blue-300'}`} 
                            placeholder="(Ex: Urbanização)"
                          />
                          e o desfecho clínico definido como
                          <input 
                            value={introOutcome} 
                            onChange={e=>setIntroOutcome(e.target.value)} 
                            className={`mx-2 border-b-2 bg-transparent outline-none text-center font-bold text-blue-900 w-40 placeholder-blue-200 ${validationError && !introOutcome ? 'border-red-500 bg-red-50' : 'border-blue-300'}`} 
                            placeholder="(Ex: Casos de Dengue)"
                          />
                          na população/local de
                          <input 
                            value={introPopulation} 
                            onChange={e=>setIntroPopulation(e.target.value)} 
                            className={`mx-2 border-b-2 bg-transparent outline-none text-center font-bold text-blue-900 w-40 placeholder-blue-200 ${validationError && !introPopulation ? 'border-red-500 bg-red-50' : 'border-blue-300'}`} 
                            placeholder="(Ex: Estado de São Paulo)"
                          />.
                          A justificativa do estudo é
                          <input 
                            value={introJustification} 
                            onChange={e=>setIntroJustification(e.target.value)} 
                            className={`mx-2 border-b-2 bg-transparent outline-none text-center font-bold text-blue-900 w-64 placeholder-blue-200 ${validationError && !introJustification ? 'border-red-500 bg-red-50' : 'border-blue-300'}`} 
                            placeholder="(Ex: é um problema de saúde pública)"
                          />.
                      </div>
                  </div>
              );
          case 'methods':
               return (
                  <div className="space-y-6 animate-in fade-in">
                      <h3 className="font-bold text-blue-900 border-b pb-2">2. Metodologia</h3>
                      <div className="bg-slate-50 p-6 rounded border border-slate-200 leading-loose text-sm">
                          Trata-se de um estudo do tipo
                          <select 
                            value={methodsDesign} 
                            onChange={e=>setMethodsDesign(e.target.value)} 
                            className={`mx-2 border rounded p-1 bg-white font-bold text-blue-900 ${validationError && !methodsDesign ? 'border-red-500' : 'border-slate-300'}`}
                          >
                                  <option value="">[Selecionar Desenho]</option>
                                  <option value="coorte">Coorte</option>
                                  <option value="ecologico">Ecológico</option>
                                  <option value="clinico">Ensaio Clínico</option>
                          </select>
                          , realizado com dados secundários de domínio público extraídos do sistema
                          <select 
                            value={methodsSystem} 
                            onChange={e=>setMethodsSystem(e.target.value)} 
                            className={`mx-2 border rounded p-1 bg-white font-bold text-blue-900 ${validationError && !methodsSystem ? 'border-red-500' : 'border-slate-300'}`}
                          >
                                  <option value="">[Selecionar Fonte]</option>
                                  <option value="SIM">SIM (Mortalidade)</option>
                                  <option value="SINAN">SINAN (Notificações)</option>
                                  <option value="SIH">SIH (Internações)</option>
                          </select>
                          do Ministério da Saúde, considerando o período de
                          <input 
                            value={methodsPeriod} 
                            onChange={e=>setMethodsPeriod(e.target.value)} 
                            className={`mx-2 border-b-2 bg-transparent outline-none text-center font-bold text-blue-900 w-32 placeholder-blue-200 ${validationError && !methodsPeriod ? 'border-red-500 bg-red-50' : 'border-blue-300'}`} 
                            placeholder="(Ex: 2015-2019)"
                          />.
                          Foram incluídos na amostra
                          <input 
                            value={methodsInclusion} 
                            onChange={e=>setMethodsInclusion(e.target.value)} 
                            className={`mx-2 border-b-2 bg-transparent outline-none text-center font-bold text-blue-900 w-48 placeholder-blue-200 ${validationError && !methodsInclusion ? 'border-red-500 bg-red-50' : 'border-blue-300'}`} 
                            placeholder="(Ex: todos os residentes do município)"
                          />.
                          Os dados foram processados no software
                          <input 
                            value={methodsSoftware} 
                            onChange={e=>setMethodsSoftware(e.target.value)} 
                            className={`mx-2 border-b-2 bg-transparent outline-none text-center font-bold text-blue-900 w-32 placeholder-blue-200 ${validationError && !methodsSoftware ? 'border-red-500 bg-red-50' : 'border-blue-300'}`} 
                            placeholder="(Ex: Excel, Tabnet)"
                          />.
                          Para a análise de associação, foi utilizado
                          <select
                            value={methodsStats}
                            onChange={e=>setMethodsStats(e.target.value)}
                            className={`mx-2 border rounded p-1 bg-white font-bold text-blue-900 ${validationError && !methodsStats ? 'border-red-500' : 'border-slate-300'}`}
                          >
                              <option value="">[Selecionar análise]</option>
                              <option value="Correlação de Pearson">Correlação de Pearson (relação linear)</option>
                              <option value="Correlação de Spearman">Correlação de Spearman (postos/monotônica)</option>
                              <option value="Análise descritiva de tendência">Análise descritiva de tendência</option>
                          </select>.
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                              <strong className="text-blue-900 block mb-1">Pearson (r)</strong>
                              Mede associação <em>linear</em> entre duas variáveis quantitativas. Varia de −1 a +1 e não demonstra causalidade.
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                              <strong className="text-purple-900 block mb-1">Spearman (ρ)</strong>
                              Usa postos e avalia associação monotônica. É útil quando a relação não é linear ou os pressupostos de Pearson não são adequados.
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                              <strong className="text-amber-900 block mb-1">Lembrete</strong>
                              Correlação não implica causalidade. Considere confundimento, qualidade dos dados e falácia ecológica.
                          </div>
                      </div>
                  </div>
              );
          case 'results':
               return (
                  <div className="space-y-4 animate-in fade-in">
                      <h3 className="font-bold text-blue-900 border-b pb-2">3. Resultados e Análise Estatística</h3>
                      <div className="flex gap-2 mb-4">
                          <button onClick={handlePaste} className="bg-blue-600 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2 hover:bg-blue-700">
                              <Clipboard size={14}/> Colar da Área de Transferência
                          </button>
                      </div>

                      {/* Attachments Box */}
                      <div className={`bg-white border-2 border-dashed min-h-[200px] p-4 rounded flex gap-4 ${validationError && (!attachments.chart || !attachments.table) ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}>
                           {attachments.table ? (
                                <div className="w-1/2 font-sans text-[10px]">
                                    <p className="font-bold mb-1">Tabela 1</p>
                                    <table className="w-full border-collapse border border-black bg-white">
                                        <thead><tr className="bg-gray-200"><th className="border p-1">Var</th><th className="border p-1">Val</th></tr></thead>
                                        <tbody>
                                            {attachments.table.rows.slice(0,4).map((r: any, i: number) => (
                                                <tr key={i}><td className="border p-1">{r.label}</td><td className="border p-1 text-right">{r.values[0]}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                           ) : <div className="w-1/2 flex items-center justify-center text-slate-300 text-xs">[Tabela]</div>}

                           {attachments.chart ? (
                                <div className="w-1/2 bg-white border h-[200px]">
                                    {renderChart(attachments.chart)}
                                </div>
                           ) : <div className="w-1/2 flex items-center justify-center text-slate-300 text-xs">[Gráfico]</div>}
                      </div>

                      {/* Stats Inputs */}
                      <div className="bg-slate-50 p-4 rounded border border-slate-200 text-sm">
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block font-bold text-blue-900 mb-1 text-xs">Interpretação do P-valor</label>
                                  <select value={resultPValue} onChange={e => setResultPValue(e.target.value)} className={`w-full p-2 rounded border ${validationError && !resultPValue ? 'border-red-500' : 'border-slate-300'}`}>
                                      <option value="">Selecione...</option>
                                      <option value="significante">p &lt; 0.05 (Estatisticamente Significante)</option>
                                      <option value="nao_significante">p &gt; 0.05 (Não Significante)</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block font-bold text-blue-900 mb-1 text-xs">IC95% do coeficiente de correlação</label>
                                  <select value={resultCI} onChange={e => setResultCI(e.target.value)} className="w-full p-2 rounded border border-slate-300">
                                      <option value="">Selecione...</option>
                                      <option value="nao_inclui_zero">Não inclui 0 (evidência de correlação)</option>
                                      <option value="inclui_zero">Inclui 0 (dados compatíveis com correlação nula)</option>
                                  </select>
                              </div>
                          </div>
                          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                              <strong>Como interpretar:</strong> o p-valor mede a compatibilidade dos dados com a hipótese nula; não informa tamanho do efeito nem relevância clínica. Para correlações, o valor nulo é <strong>0</strong>. O valor <strong>1</strong> é referência nula para medidas de razão, como RR e OR.
                          </p>
                      </div>
                  </div>
              );
          case 'discussion':
               return (
                  <div className="space-y-6 animate-in fade-in">
                      <h3 className="font-bold text-blue-900 border-b pb-2">4. Discussão & Conclusão</h3>
                      {savedReferences.length === 0 ? (
                           <div className="bg-red-50 border border-red-200 p-4 rounded flex items-center gap-3">
                               <AlertCircle className="text-red-600" size={24}/>
                               <div>
                                   <h4 className="font-bold text-red-800 text-sm">Biblioteca Vazia</h4>
                                   <p className="text-xs text-red-600">Você precisa salvar artigos no PubMed (botão "Salvar na Biblioteca") para poder citá-los aqui.</p>
                               </div>
                           </div>
                      ) : (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-6 rounded border border-slate-200 leading-loose text-sm">
                                Os resultados encontrados nesta simulação
                                <select 
                                    value={discussionConnector} 
                                    onChange={e=>setDiscussionConnector(e.target.value)} 
                                    className={`mx-2 border rounded p-1 bg-white font-bold text-blue-900 ${validationError && !discussionConnector ? 'border-red-500' : 'border-slate-300'}`}
                                >
                                        <option value="">[Escolha o Conector]</option>
                                        <option value="corroboram">corroboram (concordam)</option>
                                        <option value="divergem">divergem (discordam)</option>
                                </select>
                                com os achados descritos por
                                <select 
                                    value={discussionRefId} 
                                    onChange={e=>setDiscussionRefId(e.target.value)} 
                                    className={`mx-2 border rounded p-1 bg-white font-bold text-blue-900 max-w-[200px] ${validationError && !discussionRefId ? 'border-red-500' : 'border-slate-300'}`}
                                >
                                        <option value="">[Selecionar Artigo Salvo]</option>
                                        {savedReferences.map(ref => (
                                            <option key={ref.id} value={ref.id}>{ref.authors.split(',')[0]} et al. ({ref.year})</option>
                                        ))}
                                </select>
                                , sugerindo uma tendência epidemiológica similar.
                            </div>
                            
                            <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm">
                                <strong className="block text-yellow-800 mb-2 text-xs uppercase">Limitações do Estudo</strong>
                                O estudo apresenta limitações inerentes ao desenho, principalmente a possibilidade de 
                                <select 
                                    value={discussionLimit} 
                                    onChange={e=>setDiscussionLimit(e.target.value)} 
                                    className={`mx-2 border rounded p-1 bg-white font-bold text-yellow-900 ${validationError && !discussionLimit ? 'border-red-500' : 'border-yellow-300'}`}
                                >
                                    <option value="">[Selecione a Limitação]</option>
                                    <option value="falacia">Falácia Ecológica (inferência individual errônea)</option>
                                    <option value="memoria">Viés de Memória</option>
                                    <option value="selecao">Viés de Seleção (Subnotificação)</option>
                                </select>
                                .
                            </div>

                            <div className="bg-green-50 p-4 rounded border border-green-200 text-sm">
                                <strong className="block text-green-800 mb-2 text-xs uppercase">Implicação para Saúde Pública (Proposta de Intervenção)</strong>
                                Diante dos dados, recomenda-se aos gestores de saúde a
                                <input 
                                    value={publicHealthImpact} 
                                    onChange={e=>setPublicHealthImpact(e.target.value)} 
                                    className={`mx-2 border-b-2 bg-transparent outline-none font-bold text-green-900 w-full placeholder-green-400/50 ${validationError && !publicHealthImpact ? 'border-red-500' : 'border-green-300'}`}
                                    placeholder="(Ex: Intensificação das campanhas de vacinação na região Norte)"
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded border border-blue-200 text-sm mt-4">
                                <strong className="block text-blue-800 mb-2 text-xs uppercase font-bold">Declaração Regulamentar (Portaria CNPq nº 2.664/2026)</strong>
                                <div className="flex items-start gap-2">
                                    <input type="checkbox" id="ai-declaration" required defaultChecked disabled className="mt-1" />
                                    <label htmlFor="ai-declaration" className="text-xs text-blue-950 leading-relaxed">
                                        Declaro conformidade com a <strong>Portaria CNPq nº 2.664/2026</strong>. O uso de Inteligência Artificial Generativa neste simulador acadêmico foi estritamente declarado para fins de estruturação textual e auxílio metodológico.
                                    </label>
                                </div>
                            </div>
                        </div>
                      )}
                  </div>
              );
      }
  }

  if (openedDocument) {
      const storedText = typeof openedDocument.content === 'string'
          ? openedDocument.content
          : openedDocument.content?.text || 'Este documento não possui conteúdo textual disponível.';
      return (
          <div className="h-full bg-slate-800 flex flex-col overflow-hidden">
              <div className="bg-[#2b579a] text-white px-4 py-3 flex items-center gap-3 shrink-0">
                  <FileText size={18}/>
                  <div className="min-w-0">
                      <div className="text-sm font-bold truncate">{openedDocument.name}</div>
                      <div className="text-[10px] text-blue-100">Documento salvo • modo de leitura</div>
                  </div>
                  <div className="flex-1"/>
                  <button onClick={() => { setOpenedDocument(null); onCloseDocument?.(); }} className="bg-white/15 hover:bg-white/25 px-3 py-2 rounded-lg text-xs font-bold">
                      Fechar documento
                  </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 md:p-8">
                  <article className="bg-white max-w-4xl min-h-full mx-auto shadow-2xl p-5 md:p-12 text-slate-900">
                      <h1 className="text-xl md:text-3xl font-serif font-bold text-center mb-2">Manuscrito científico final</h1>
                      <p className="text-xs text-center text-slate-500 mb-8">Aberto a partir de Meus Arquivos</p>
                      <div className="whitespace-pre-wrap font-serif text-sm leading-7 text-justify">{storedText}</div>
                  </article>
              </div>
          </div>
      );
  }

  // FULL SIMULATED ARTICLE PREVIEW
  if (showFullPreview) {
      const citedArticle = savedReferences.find(r => r.id === discussionRefId);
      return (
          <div className="absolute inset-0 bg-slate-800 z-50 flex flex-col items-center pt-3 md:pt-8 pb-4 overflow-hidden">
              <div className="flex items-center gap-4 text-white mb-4 w-full max-w-4xl px-4">
                  <CheckCircle className="text-green-400"/>
                  <h2 className="text-xl font-bold">Manuscrito Gerado com Sucesso</h2>
                  <div className="flex-1"></div>
                  <button onClick={handleFinalize} className="bg-white text-slate-900 px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-slate-200">
                      <Printer size={16}/> Fechar e Salvar
                  </button>
              </div>
              <div className="bg-white w-full max-w-4xl flex-1 overflow-y-auto p-5 md:p-12 shadow-2xl animate-in slide-in-from-bottom-10">
                   <div className="font-serif text-slate-900">
                       <h1 className="text-3xl font-bold text-center mb-2 uppercase">Análise Epidemiológica: {introExposure} e {introOutcome}</h1>
                       <p className="text-center text-sm italic mb-8 text-slate-600">Departamento de Medicina Preventiva - PIG IV</p>
                       
                       <div className="columns-1 md:columns-2 gap-8 text-justify text-sm leading-relaxed">
                           <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Introdução</h3>
                           <p className="mb-4">
                               As doenças negligenciadas e crônicas representam um desafio significativo para a saúde pública no Brasil. 
                               O presente estudo tem como objetivo analisar a correlação espacial entre a variável de exposição <strong>{introExposure}</strong> e o desfecho clínico definido como <strong>{introOutcome}</strong> no período selecionado. 
                               A compreensão desta dinâmica é fundamental para o planejamento de políticas públicas.
                           </p>

                           <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Metodologia</h3>
                           <p className="mb-4">
                               Trata-se de um estudo do tipo <strong>{methodsDesign}</strong>, realizado com dados secundários de domínio público.
                               A coleta de dados foi realizada através do sistema <strong>{methodsSystem}</strong>, plataforma oficial do Ministério da Saúde (DATASUS),
                               garantindo a confiabilidade e representatividade das informações analisadas.
                           </p>

                           <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Resultados</h3>
                           <p className="mb-4">
                               A análise dos dados revelou padrões importantes na distribuição dos casos. O teste de hipótese demonstrou um resultado <strong>{resultPValue === 'significante' ? 'estatisticamente significante (p < 0.05)' : 'não significante'}</strong>.
                               Abaixo apresentamos a tabulação principal dos dados coletados.
                           </p>
                           
                           <div className="break-inside-avoid mb-6 border p-2">
                                <p className="text-center text-xs font-bold mb-2">Figura 1. Correlação entre Exposição e Desfecho.</p>
                                {attachments.chart && (
                                    <div className="w-full h-40">
                                        {renderChart(attachments.chart)}
                                    </div>
                                )}
                           </div>

                           <div className="break-inside-avoid mb-6 border p-2">
                                <p className="text-center text-xs font-bold mb-2">Tabela 1. Dados consolidados.</p>
                                {attachments.table && (
                                    <table className="w-full text-[10px] border-collapse border border-black">
                                        <thead>
                                            <tr className="bg-gray-100"><th className="border p-1">Var</th><th className="border p-1">Valor</th></tr>
                                        </thead>
                                        <tbody>
                                            {attachments.table.rows.slice(0,3).map((r:any, i:number) => (
                                                <tr key={i}><td className="border p-1">{r.label}</td><td className="border p-1">{r.values[0]}</td></tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                           </div>

                           <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Discussão</h3>
                           <p className="mb-4">
                               Os resultados encontrados nesta simulação <strong>{discussionConnector}</strong> com os achados descritos na literatura recente,
                               especificamente no trabalho de {citedArticle ? `${citedArticle.authors.split(',')[0]} et al.` : 'Autores (2024)'}.
                               É fundamental destacar que, devido à natureza ecológica do estudo, estamos sujeitos à <strong>{discussionLimit === 'falacia' ? 'Falácia Ecológica' : 'vieses de informação'}</strong>,
                               não sendo possível inferir causalidade no nível individual.
                           </p>

                           <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Conclusão</h3>
                           <p className="mb-4">
                               Com base nos dados, recomenda-se <strong>{publicHealthImpact}</strong> como medida prioritária de intervenção.
                               Conclui-se que há uma relevância epidemiológica no tema abordado, demandando novos estudos analíticos.
                           </p>

                           <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Uso de IA (Portaria CNPq nº 2.664/2026)</h3>
                           <p className="mb-4 text-xs text-slate-600 italic">
                               O uso de inteligência artificial generativa nesta simulação acadêmica foi devidamente declarado conforme O Conselho Nacional de Desenvolvimento Científico e Tecnológico (CNPq) instituiu a Portaria nº 2.664/2026, que regulamenta o uso de Inteligência Artificial Generativa na pesquisa acadêmica. O simulador atuou exclusivamente como facilitador metodológico e estruturador textual de autoria humana.
                           </p>

                           <h3 className="font-bold uppercase text-xs tracking-wider mb-2 border-b border-black pb-1">Referências</h3>
                           <p className="text-xs mb-4 pl-4 -indent-4">
                               {citedArticle ? `${citedArticle.authors.toUpperCase()}. ${citedArticle.title}. ${citedArticle.journal}, ${citedArticle.year}.` : ''}
                           </p>
                       </div>
                   </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-[#f3f4f6] relative">
      {/* Toast Notification */}
      {toast && (
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 animate-in slide-in-from-top-2 fade-in ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
              {toast.type === 'success' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
              {toast.msg}
          </div>
      )}

      <div className="min-h-14 bg-[#2b579a] border-b border-blue-900 flex flex-wrap md:flex-nowrap items-center px-2 md:px-4 py-2 gap-2 shadow-sm z-10 text-white">
          <div className="flex items-center gap-2 font-bold mr-4"><FileText/> Pigword</div>
          <div className="h-8 w-px bg-white/20 mx-2"></div>
          <div className="order-3 md:order-none w-full md:w-auto md:flex-1 flex justify-start md:justify-center overflow-x-auto">
               <div className="flex bg-blue-800/50 p-1 rounded-lg min-w-max">
                   {['intro', 'methods', 'results', 'discussion'].map(sec => (
                       <button 
                        key={sec}
                        onClick={() => setActiveSection(sec as Section)}
                        className={`px-3 md:px-4 py-1 rounded text-xs font-bold capitalize transition-colors ${activeSection === sec ? 'bg-white text-blue-900' : 'text-blue-200 hover:text-white'}`}
                       >
                           {sec === 'intro' ? 'Introdução' : sec === 'methods' ? 'Métodos' : sec === 'results' ? 'Resultados' : 'Discussão'}
                       </button>
                   ))}
               </div>
          </div>
          <button onClick={handleSave} className="ml-auto flex items-center gap-2 text-xs font-bold text-blue-900 bg-white px-4 md:px-6 py-2 rounded hover:bg-blue-50 active:translate-y-0.5 transition-all shadow-sm">
              <Save size={16}/> Salvar
          </button>
      </div>
      <div className="flex-1 overflow-auto p-2 md:p-8 flex justify-center bg-[#e5e7eb] relative">
          <div className="bg-white shadow-xl w-full md:w-[21cm] min-h-full md:min-h-[29.7cm] p-4 md:p-[2.5cm] flex flex-col outline-none text-slate-900 relative">
              <h1 className="text-center font-bold text-xl mb-8 font-serif uppercase">Manuscrito Científico Guiado</h1>
              {renderSectionContent()}
          </div>
      </div>
      
      {/* Validation Error Modal */}
      {validationError && (
          <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full border-l-8 border-red-500 animate-in shake">
                  <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2"><AlertCircle/> Pendências Encontradas</h3>
                  <ul className="space-y-1 text-sm text-red-700 list-disc pl-5 mb-4">
                      {validationError.map((err, idx) => (
                          <li key={idx}>{err}</li>
                      ))}
                  </ul>
                  <button onClick={() => setValidationError(null)} className="w-full bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700">
                      Corrigir Agora
                  </button>
              </div>
          </div>
      )}

      {(isSaving || plagiarismCheck || isCompressing) && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white p-8 rounded-xl shadow-2xl w-96 flex flex-col items-center animate-in zoom-in duration-200">
                  {plagiarismCheck ? (
                      <>
                        <ScanSearch size={48} className="animate-pulse text-purple-600 mb-4"/>
                        <h3 className="font-bold text-slate-700 mb-1">Verificando Originalidade...</h3>
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-purple-600 animate-[shimmer_1s_infinite] w-full"></div>
                        </div>
                      </>
                  ) : isCompressing ? (
                       <>
                        <DownloadCloud size={48} className="animate-bounce text-green-600 mb-4"/>
                        <h3 className="font-bold text-slate-700 mb-1">Salvando em Meus Documentos...</h3>
                        <p className="text-xs text-slate-500 mt-2 text-center">Comprimindo Artigo_Final.doc</p>
                        <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-green-600 animate-[shimmer_0.5s_infinite] w-full"></div>
                        </div>
                      </>
                  ) : (
                      <>
                        <Loader2 size={48} className="animate-spin text-blue-600 mb-4"/>
                        <h3 className="font-bold text-slate-700 mb-1">Gerando Visualização...</h3>
                        <p className="text-xs text-slate-500 mt-2">Renderizando PDF...</p>
                      </>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
