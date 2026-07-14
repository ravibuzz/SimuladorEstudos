
import React, { useState } from 'react';
import { Layout, Type, Image, Download, CheckCircle, Palette, Grid, MousePointer2 } from 'lucide-react';

interface BannerSection {
    id: string;
    label: string;
    placed: boolean;
}

export const BannerDesigner: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [colorTheme, setColorTheme] = useState('blue');
    const [qualityChecks, setQualityChecks] = useState({ concise: false, readable: false, honest: false });
    const [sections, setSections] = useState<BannerSection[]>([
        { id: 'header', label: 'Cabeçalho (Título/Autores)', placed: false },
        { id: 'intro', label: 'Introdução', placed: false },
        { id: 'methods', label: 'Metodologia', placed: false },
        { id: 'results', label: 'Resultados (Gráficos)', placed: false },
        { id: 'discussion', label: 'Discussão', placed: false },
        { id: 'conclusion', label: 'Conclusão', placed: false },
        { id: 'refs', label: 'Referências', placed: false },
    ]);
    const [isFinished, setIsFinished] = useState(false);

    const placeSection = (id: string) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, placed: true } : s));
    };

    const allPlaced = sections.every(s => s.placed);
    const qualityApproved = Object.values(qualityChecks).every(Boolean);
    const completedTasks = sections.filter(s => s.placed).length + Object.values(qualityChecks).filter(Boolean).length;
    const progress = Math.round((completedTasks / (sections.length + 3)) * 100);

    const handleFinish = () => {
        if (!allPlaced || !qualityApproved) {
            return;
        }
        setIsFinished(true);
        setTimeout(onFinish, 2500);
    };

    const getThemeColor = (type: 'bg' | 'text' | 'border') => {
        const colors: Record<string, any> = {
            blue: { bg: 'bg-blue-900', text: 'text-blue-900', border: 'border-blue-900' },
            green: { bg: 'bg-[#107c41]', text: 'text-[#107c41]', border: 'border-[#107c41]' },
            purple: { bg: 'bg-purple-800', text: 'text-purple-800', border: 'border-purple-800' },
            red: { bg: 'bg-red-800', text: 'text-red-800', border: 'border-red-800' },
        };
        return colors[colorTheme][type];
    };

    if (isFinished) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 animate-in zoom-in">
                <div className="relative">
                    <CheckCircle size={80} className="text-green-500 mb-4" />
                    <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-ping"></div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Banner Finalizado!</h2>
                <p className="text-slate-600">Compactando arquivo para envio...</p>
                <div className="w-64 bg-slate-200 h-2 rounded-full mt-6 overflow-hidden">
                    <div className="bg-green-500 h-full animate-[shimmer_1.5s_infinite] w-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col md:flex-row bg-slate-100 font-sans overflow-hidden">
            {/* Sidebar Tools */}
            <div className="w-full md:w-72 max-h-[54%] md:max-h-none bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shadow-lg z-10 shrink-0">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2"><Layout className="text-blue-600"/> Estúdio de Criação</h2>
                    <p className="text-xs text-slate-500 mt-1">Monte seu banner científico</p>
                </div>

                <div className="p-4 space-y-6 overflow-y-auto flex-1">
                    {/* Theme Selector */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2"><Palette size={14}/> Cor do Tema</label>
                        <div className="flex gap-2">
                            {['blue', 'green', 'purple', 'red'].map(c => (
                                <button 
                                    key={c} 
                                    onClick={() => setColorTheme(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${colorTheme === c ? 'border-slate-600 scale-110 ring-2 ring-offset-1 ring-slate-300' : 'border-transparent'} ${c === 'blue' ? 'bg-blue-900' : c === 'green' ? 'bg-[#107c41]' : c === 'purple' ? 'bg-purple-800' : 'bg-red-800'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2"><CheckCircle size={14}/> Revisão antes de exportar</label>
                        <div className="space-y-2">
                            {[
                                ['concise', 'Textos curtos e legíveis a distância'],
                                ['readable', 'Gráficos com título, eixos, unidade e fonte'],
                                ['honest', 'Conclusão sem afirmar causalidade indevida']
                            ].map(([key, label]) => (
                                <label key={key} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={qualityChecks[key as keyof typeof qualityChecks]} onChange={event => setQualityChecks(previous => ({ ...previous, [key]: event.target.checked }))} className="mt-0.5"/>
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Components List */}
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3"><Grid size={14}/> Componentes</label>
                        <div className="grid grid-cols-1 gap-2">
                            {sections.map(section => (
                                <button 
                                    key={section.id}
                                    onClick={() => placeSection(section.id)}
                                    disabled={section.placed}
                                    className={`p-3 rounded border text-left text-sm font-medium flex items-center justify-between transition-all ${
                                        section.placed 
                                        ? 'bg-green-50 border-green-200 text-green-700 opacity-50 cursor-default' 
                                        : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md hover:-translate-x-1 active:scale-95'
                                    }`}
                                >
                                    <span>{section.label}</span>
                                    {section.placed ? <CheckCircle size={16}/> : <MousePointer2 size={16} className="text-slate-400"/>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Progresso</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full mb-4 overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ${allPlaced && qualityApproved ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{width: `${progress}%`}}
                        ></div>
                    </div>
                    <button 
                        onClick={handleFinish} 
                        disabled={!allPlaced || !qualityApproved}
                        className="w-full bg-slate-800 text-white py-3 rounded font-bold shadow hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        <Download size={16}/> {allPlaced && qualityApproved ? 'Salvar banner final' : 'Complete seções e revisão'}
                    </button>
                </div>
            </div>

            {/* Canvas Preview */}
            <div className="flex-1 p-3 md:p-10 overflow-auto bg-slate-100 flex justify-center items-start">
                <div className="bg-white shadow-2xl w-full max-w-[700px] min-h-[720px] md:min-h-[1000px] flex flex-col relative transition-all duration-500 border border-slate-300">
                    
                    {/* Header Section */}
                    {sections.find(s => s.id === 'header')?.placed ? (
                        <div className={`${getThemeColor('bg')} text-white p-4 md:p-8 text-center animate-in slide-in-from-top-10`}>
                            <h1 className="text-lg md:text-3xl font-bold uppercase mb-2">Título do Trabalho Científico</h1>
                            <p className="text-sm md:text-lg opacity-90">Autores: Estudante de Medicina, Orientador PIG IV</p>
                            <p className="text-sm opacity-70 mt-2">Faculdade de Medicina</p>
                        </div>
                    ) : (
                        <div className="h-40 border-2 border-dashed border-slate-300 m-4 rounded flex items-center justify-center text-slate-400 text-sm uppercase font-bold tracking-widest bg-slate-50">
                            Área do Cabeçalho
                        </div>
                    )}

                    {/* Body Grid */}
                    <div className="flex-1 p-3 md:p-6 grid grid-cols-2 gap-3 md:gap-6">
                        <div className="flex flex-col gap-3 md:gap-6">
                            {/* Intro */}
                            {sections.find(s => s.id === 'intro')?.placed ? (
                                <div className="bg-slate-50 p-4 rounded border border-slate-200 animate-in zoom-in">
                                    <h3 className={`${getThemeColor('text')} font-bold border-b-2 ${getThemeColor('border')} mb-2 uppercase text-sm`}>Introdução</h3>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-slate-300 rounded w-full"></div>
                                        <div className="h-2 bg-slate-300 rounded w-5/6"></div>
                                        <div className="h-2 bg-slate-300 rounded w-full"></div>
                                    </div>
                                </div>
                            ) : <div className="h-32 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-300 text-xs font-bold">INTRODUÇÃO</div>}

                            {/* Methods */}
                            {sections.find(s => s.id === 'methods')?.placed ? (
                                <div className="bg-slate-50 p-4 rounded border border-slate-200 animate-in zoom-in">
                                    <h3 className={`${getThemeColor('text')} font-bold border-b-2 ${getThemeColor('border')} mb-2 uppercase text-sm`}>Metodologia</h3>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-slate-300 rounded w-full"></div>
                                        <div className="h-2 bg-slate-300 rounded w-4/5"></div>
                                    </div>
                                </div>
                            ) : <div className="h-32 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-300 text-xs font-bold">METODOLOGIA</div>}

                            {/* Results */}
                            {sections.find(s => s.id === 'results')?.placed ? (
                                <div className="bg-slate-50 p-4 rounded border border-slate-200 flex-1 animate-in zoom-in">
                                    <h3 className={`${getThemeColor('text')} font-bold border-b-2 ${getThemeColor('border')} mb-2 uppercase text-sm`}>Resultados</h3>
                                    <div className="flex items-center justify-center h-32 bg-white border border-slate-200 rounded">
                                        <div className="flex items-end gap-2 h-20">
                                            <div className={`w-4 h-10 ${getThemeColor('bg')} opacity-50`}></div>
                                            <div className={`w-4 h-16 ${getThemeColor('bg')} opacity-70`}></div>
                                            <div className={`w-4 h-12 ${getThemeColor('bg')} opacity-60`}></div>
                                            <div className={`w-4 h-20 ${getThemeColor('bg')}`}></div>
                                        </div>
                                    </div>
                                </div>
                            ) : <div className="h-48 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-300 text-xs font-bold">RESULTADOS</div>}
                        </div>

                        <div className="flex flex-col gap-3 md:gap-6">
                            {/* Discussion */}
                            {sections.find(s => s.id === 'discussion')?.placed ? (
                                <div className="bg-slate-50 p-4 rounded border border-slate-200 flex-1 animate-in zoom-in">
                                    <h3 className={`${getThemeColor('text')} font-bold border-b-2 ${getThemeColor('border')} mb-2 uppercase text-sm`}>Discussão</h3>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-slate-300 rounded w-full"></div>
                                        <div className="h-2 bg-slate-300 rounded w-full"></div>
                                        <div className="h-2 bg-slate-300 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ) : <div className="h-40 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-300 text-xs font-bold">DISCUSSÃO</div>}

                            {/* Conclusion */}
                            {sections.find(s => s.id === 'conclusion')?.placed ? (
                                <div className="bg-slate-50 p-4 rounded border border-slate-200 animate-in zoom-in">
                                    <h3 className={`${getThemeColor('text')} font-bold border-b-2 ${getThemeColor('border')} mb-2 uppercase text-sm`}>Conclusão</h3>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-slate-300 rounded w-full"></div>
                                        <div className="h-2 bg-slate-300 rounded w-5/6"></div>
                                    </div>
                                </div>
                            ) : <div className="h-24 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-300 text-xs font-bold">CONCLUSÃO</div>}

                            {/* References */}
                            {sections.find(s => s.id === 'refs')?.placed ? (
                                <div className="bg-slate-50 p-4 rounded border border-slate-200 animate-in zoom-in">
                                    <h3 className={`${getThemeColor('text')} font-bold border-b-2 ${getThemeColor('border')} mb-2 uppercase text-sm`}>Referências</h3>
                                    <div className="space-y-2 opacity-50">
                                        <div className="h-1.5 bg-slate-400 rounded w-full"></div>
                                        <div className="h-1.5 bg-slate-400 rounded w-full"></div>
                                    </div>
                                </div>
                            ) : <div className="h-20 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-300 text-xs font-bold">REFERÊNCIAS</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
