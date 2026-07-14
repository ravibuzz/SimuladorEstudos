import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  BarChart2, 
  Share2, 
  Check, 
  AlertCircle, 
  TrendingUp, 
  HelpCircle,
  FolderOpen,
  Sigma,
  MousePointerClick
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { VirtualFile, ClipboardItem, TabnetData } from '../../types';

interface DataStudioProps {
  fileSystem: VirtualFile[];
  setClipboard: (item: ClipboardItem) => void;
  onCopySuccess: (type: 'chart' | 'table') => void;
  initialFile?: VirtualFile | null;
}

export const DataStudio: React.FC<DataStudioProps> = ({
  fileSystem,
  setClipboard,
  onCopySuccess,
  initialFile
}) => {
  const [selectedFile, setSelectedFile] = useState<VirtualFile | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [copiedType, setCopiedType] = useState<'chart' | 'table' | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [pendingCopy, setPendingCopy] = useState<'chart' | 'table' | null>(null);

  // Load initial file if provided
  useEffect(() => {
    if (initialFile && initialFile.type === 'csv') {
      setSelectedFile(initialFile);
      setSelectedRowIndex(0);
    }
  }, [initialFile]);

  // Find all available CSV files in downloads folder
  const csvFiles = fileSystem.filter(f => f.type === 'csv');

  // Handle opening a file manually
  const handleOpenFile = (file: VirtualFile) => {
    setSelectedFile(file);
    setSelectedRowIndex(0);
    setCopiedType(null);
  };

  const handleCopy = (type: 'chart' | 'table') => {
    if (!selectedFile || !data) return;
    
    if (!quizPassed) {
        setPendingCopy(type);
        setShowQuiz(true);
        return;
    }
    
    let copyData: any = selectedFile.content;

    if (type === 'chart') {
      const row = data.rows[selectedRowIndex];
      const series = data.columns.map((col: string, i: number) => ({
        name: col,
        value: row.values[i]
      }));
      copyData = {
        chartType: 'bar',
        series: series
      };
    }

    const clipboardItem: ClipboardItem = {
      type,
      data: copyData,
      title: `${selectedFile.name} - ${type === 'chart' ? 'Gráfico de Regressão' : 'Tabela de Dados'}`,
      timestamp: Date.now()
    };

    setClipboard(clipboardItem);
    setCopiedType(type);
    onCopySuccess(type);

    setTimeout(() => {
      setCopiedType(null);
    }, 3000);
  };

  // Safe typecast of virtual file content
  const data: TabnetData | null = selectedFile ? (selectedFile.content as TabnetData) : null;

  // --- STATISTICAL CALCULATIONS ---
  // Calculates linear regression and correlation for the selected row
  const calculateStats = () => {
    if (!data || !data.rows[selectedRowIndex]) return null;

    const row = data.rows[selectedRowIndex];
    const columns = data.columns;
    
    // Convert column labels to years (X variables)
    const X = columns.map(c => parseInt(c, 10)).filter(num => !isNaN(num));
    const Y = row.values.slice(0, X.length);

    const N = X.length;
    if (N < 2) return { correlation: 0, slope: 0, intercept: 0, meanY: 0, trend: 'Estável' };

    const sumX = X.reduce((a, b) => a + b, 0);
    const sumY = Y.reduce((a, b) => a + b, 0);
    const meanX = sumX / N;
    const meanY = sumY / N;

    let numCorr = 0;
    let denCorrX = 0;
    let denCorrY = 0;
    let numSlope = 0;
    let denSlope = 0;

    for (let i = 0; i < N; i++) {
      const diffX = X[i] - meanX;
      const diffY = Y[i] - meanY;
      numCorr += diffX * diffY;
      denCorrX += diffX * diffX;
      denCorrY += diffY * diffY;
      
      numSlope += diffX * diffY;
      denSlope += diffX * diffX;
    }

    const correlation = denCorrX * denCorrY !== 0 ? numCorr / Math.sqrt(denCorrX * denCorrY) : 0;
    const slope = denSlope !== 0 ? numSlope / denSlope : 0;
    const intercept = meanY - slope * meanX;

    let trend = 'Estável';
    if (slope > 0.1) trend = 'Ascendente 📈';
    else if (slope < -0.1) trend = 'Declinante 📉';

    return {
      correlation,
      slope,
      intercept,
      meanY,
      trend
    };
  };

  const stats = calculateStats();

  // Prepare data for Recharts
  const chartData = data ? data.columns.map((col, cIdx) => {
    const item: any = { year: col };
    data.rows.forEach(row => {
      item[row.label] = row.values[cIdx];
    });
    return item;
  }) : [];

  const activeRowLabel = data && data.rows[selectedRowIndex] ? data.rows[selectedRowIndex].label : '';

  const handleQuizSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      setQuizPassed(true);
      setShowQuiz(false);
      if (pendingCopy) {
        handleCopy(pendingCopy);
        setPendingCopy(null);
      }
    } else {
      setQuizError(true);
      setTimeout(() => setQuizError(false), 2000);
    }
  };

  return (
    <div className="h-full bg-slate-900 text-slate-100 flex flex-col font-sans select-none border border-slate-700/50 rounded-lg overflow-hidden shadow-2xl relative">
      
      {showQuiz && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={20}/>
              Desafio de Bioestatística
            </h3>
            <p className="text-sm text-slate-200 mb-6">
              Para validar a interpretação estatística, responda corretamente:
              <br/><br/>
              <strong>O que significa um p-valor menor que 0.05 em um estudo estatístico?</strong>
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => handleQuizSubmit(true)}
                className="w-full text-left p-3 rounded-lg border border-slate-700 hover:border-emerald-500 hover:bg-emerald-950/30 text-sm transition-all"
              >
                A) Com α = 0,05, os dados são pouco compatíveis com H0 e podemos rejeitá-la, se os pressupostos do teste forem adequados; isso não prova causalidade.
              </button>
              <button 
                onClick={() => handleQuizSubmit(false)}
                className="w-full text-left p-3 rounded-lg border border-slate-700 hover:border-red-500 hover:bg-red-950/30 text-sm transition-all"
              >
                B) Aceita-se a Hipótese Nula (não existe associação).
              </button>
              <button 
                onClick={() => handleQuizSubmit(false)}
                className="w-full text-left p-3 rounded-lg border border-slate-700 hover:border-red-500 hover:bg-red-950/30 text-sm transition-all"
              >
                C) Indica que o estudo teve um erro amostral de 5%.
              </button>
            </div>
            {quizError && (
              <p className="text-red-400 text-xs font-bold mt-4 animate-pulse">Resposta Incorreta! Tente novamente.</p>
            )}
          </div>
        </div>
      )}

      {/* Excel Header Accent bar */}
      <div className="bg-[#107c41] px-5 py-2.5 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="text-white fill-white/10" size={24} />
          <span className="font-extrabold text-sm tracking-wider text-white">PIGXCEL DATA ENGINE</span>
          <span className="text-[10px] bg-green-800 text-green-100 font-mono px-1.5 py-0.5 rounded ml-2">v4.0 PRO</span>
        </div>
        <div className="text-xs text-green-100 font-mono">
          {selectedFile ? `Arquivo Ativo: ${selectedFile.name}` : 'Nenhum arquivo carregado'}
        </div>
      </div>

      {/* Main layout */}
      {!selectedFile ? (
        // Blank Splash Screen with downloads files selector
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-5 border border-green-500/20">
            <FolderOpen size={36} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Abra sua planilha do DATASUS</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Faça primeiro a pesquisa e download do arquivo <span className="font-mono text-green-400 font-bold">.CSV</span> no site do DATASUS através do navegador <strong>Piggle Chrome</strong>. Os arquivos baixados aparecerão aqui automaticamente para análise.
          </p>

          {csvFiles.length > 0 ? (
            <div className="w-full bg-slate-950 rounded-xl p-4 border border-slate-800">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 text-left font-mono flex items-center gap-1.5">
                <Download size={12} className="text-blue-400" />
                Arquivos Disponíveis na pasta Downloads:
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {csvFiles.map(file => (
                  <button
                    key={file.id}
                    onClick={() => handleOpenFile(file)}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-left px-3.5 py-2.5 rounded-lg border border-slate-800 hover:border-green-500/30 transition-all text-xs flex items-center justify-between font-medium group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="text-emerald-500" size={14} />
                      <span className="text-slate-200 group-hover:text-white truncate max-w-xs">{file.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Abrir &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300 text-left flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>Nenhum .csv encontrado!</strong> Abra o <strong>Piggle Chrome</strong> e acesse o site do DATASUS (Tabnet) para pesquisar e baixar os dados ecológicos simulados do seu protocolo.
              </div>
            </div>
          )}
        </div>
      ) : (
        // Spreadsheet Dashboard
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Panel: Excel Grid & File details */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
            {/* Toolbar row */}
            <div className="bg-slate-950 border-b border-slate-850 px-4 py-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] font-bold border border-slate-800 hover:border-slate-700 text-slate-300 rounded cursor-pointer"
                >
                  &larr; Abrir Outro
                </button>
                <div className="h-4 w-px bg-slate-800 mx-1"></div>
                <span className="text-xs text-slate-400">Título: <strong className="text-slate-200">{data?.title}</strong></span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleCopy('table')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedType === 'table' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                  }`}
                >
                  {copiedType === 'table' ? <Check size={13} /> : <Copy size={13} />}
                  <span>Copiar Tabela</span>
                </button>
                <button 
                  onClick={() => handleCopy('chart')}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedType === 'chart' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700'
                  }`}
                >
                  {copiedType === 'chart' ? <Check size={13} /> : <BarChart2 size={13} />}
                  <span>Copiar Gráfico</span>
                </button>
              </div>
            </div>

            {/* Excel Grid Table view */}
            <div className="flex-1 overflow-auto bg-slate-900/40 p-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 font-mono border-b border-slate-800">
                      <th className="py-2.5 px-3 border-r border-slate-850 text-center w-12 bg-slate-950"></th>
                      <th className="py-2.5 px-4 border-r border-slate-850 font-bold text-slate-200">Coluna A (Região/Local)</th>
                      {data?.columns.map((col, idx) => (
                        <th key={idx} className="py-2.5 px-4 border-r border-slate-850 text-center font-bold text-slate-200">
                          {col} (Coluna {String.fromCharCode(66 + idx)})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data?.rows.map((row, rIdx) => {
                      const isActive = selectedRowIndex === rIdx;
                      return (
                        <tr 
                          key={rIdx}
                          onClick={() => setSelectedRowIndex(rIdx)}
                          className={`border-b border-slate-850/60 hover:bg-slate-850/40 cursor-pointer transition-colors ${
                            isActive ? 'bg-green-600/10 text-white' : 'text-slate-300'
                          }`}
                        >
                          <td className="py-2.5 px-3 border-r border-slate-850 text-center text-slate-500 font-mono bg-slate-950/60">
                            {rIdx + 1}
                          </td>
                          <td className="py-2.5 px-4 border-r border-slate-850 font-semibold flex items-center justify-between">
                            <span>{row.label}</span>
                            {isActive && <MousePointerClick size={12} className="text-green-500 animate-pulse shrink-0 ml-1" />}
                          </td>
                          {row.values.map((val, vIdx) => (
                            <td key={vIdx} className="py-2.5 px-4 border-r border-slate-850 text-center font-mono">
                              {val.toLocaleString('pt-BR')}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                <MousePointerClick size={12} className="text-green-500" />
                <span>Clique em qualquer linha da tabela para atualizar o gráfico e os cálculos estatísticos correspondentes.</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Statistical Analysis & Dynamic Visualizer Chart */}
          <div className="w-full md:w-80 shrink-0 bg-slate-950 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="text-green-500" size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Regressão & Tendência</span>
                </div>
                <h3 className="text-sm font-bold text-white">Análise de Tendência de Região</h3>
              </div>

              {/* Stats Card */}
              {stats && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                    Local: <span className="text-green-400 font-sans font-bold text-xs lowercase first-letter:uppercase">{activeRowLabel}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <div className="text-[9px] text-slate-500 uppercase font-mono leading-none">Média Anual</div>
                      <div className="text-sm font-bold text-white mt-1 font-mono">
                        {stats.meanY.toFixed(1)}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <div className="text-[9px] text-slate-500 uppercase font-mono leading-none">Coef. Pearson (r)</div>
                      <div className="text-sm font-bold text-yellow-400 mt-1 font-mono">
                        {stats.correlation.toFixed(3)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Modelo Ajustado:</span>
                      <span className="font-mono text-green-400 font-semibold">y = ax + b</span>
                    </div>
                    <div className="font-mono text-xs text-slate-200 bg-slate-900 p-1.5 rounded border border-slate-850 text-center">
                      Y = {stats.slope.toFixed(2)} * X + {stats.intercept.toFixed(1)}
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Direção da Tendência:</span>
                      <span className="font-bold text-white">{stats.trend}</span>
                    </div>
                  </div>

                  <div className="bg-green-600/10 border border-green-500/20 rounded-lg p-3 text-[11px] text-green-300 leading-relaxed">
                    <strong>Interpretação científica:</strong>{' '}
                    {Math.abs(stats.correlation) >= 0.7
                      ? `A série mostra relação linear ${stats.correlation >= 0 ? 'positiva' : 'negativa'} forte entre ano e o indicador neste local.`
                      : Math.abs(stats.correlation) >= 0.4
                        ? `A série mostra relação linear ${stats.correlation >= 0 ? 'positiva' : 'negativa'} moderada entre ano e o indicador.`
                        : 'A relação linear entre ano e o indicador é fraca nesta série.'}
                    {' '}O valor de r não prova causalidade nem substitui intervalo de confiança ou teste de hipótese; outliers, não linearidade, poucos anos e mudanças de registro podem alterar o resultado.
                  </div>
                </div>
              )}

              {/* Miniature Chart Visualizer */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-400 uppercase font-mono text-[10px]">Visualização de Tendência</span>
                  <button 
                    onClick={() => setShowFormulaInfo(!showFormulaInfo)} 
                    className="text-slate-500 hover:text-white"
                    title="Explicar Matemática"
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>

                {showFormulaInfo && (
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-[10px] text-slate-400 leading-relaxed animate-in fade-in">
                    <Sigma size={12} className="inline mr-1 text-yellow-500" />
                    <strong>Pearson (r)</strong> varia de −1 a +1 e resume direção e intensidade de uma relação <em>linear</em> entre duas variáveis quantitativas. Perto de zero significa pouca relação linear, não necessariamente ausência de qualquer relação. <strong>Spearman (ρ)</strong> usa postos e pode ser preferível para relação monotônica, dados ordinais ou forte influência de valores extremos. Nenhum deles demonstra causa e efeito. A linha verde tracejada representa a <strong>média do período</strong>.
                  </div>
                )}

                <div className="bg-slate-900 border border-slate-850 rounded-xl p-2.5 h-44 shadow-inner flex items-center justify-center">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="year" stroke="#64748b" fontSize={9} />
                        <YAxis stroke="#64748b" fontSize={9} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 10 }} 
                          labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={activeRowLabel} 
                          stroke="#10b981" 
                          strokeWidth={2.5} 
                          dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
                          activeDot={{ r: 6 }}
                        />
                        {stats && (
                          <ReferenceLine y={stats.meanY} stroke="#f59e0b" strokeDasharray="3 3" />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-xs text-slate-600">Erro ao carregar dados do gráfico</div>
                  )}
                </div>
              </div>
            </div>

            {/* Prompt actions indicator */}
            <div className="mt-5 pt-3 border-t border-slate-850 text-[10px] text-slate-500 leading-relaxed">
              * Para avançar no desenvolvimento de sua pesquisa, use os botões <strong>Copiar Tabela</strong> ou <strong>Copiar Gráfico</strong> no topo para salvar os dados na Área de Trabalho e poder colá-los no <strong>Pigword</strong>.
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
