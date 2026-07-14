import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileSpreadsheet, 
  FileText, 
  Trash2, 
  Search, 
  ArrowLeft, 
  ChevronRight, 
  RefreshCw, 
  HardDrive, 
  Download, 
  File, 
  Sparkles,
  Undo
} from 'lucide-react';
import { VirtualFile, FolderType } from '../../types';

interface ExplorerProps {
  fileSystem: VirtualFile[];
  startPath: 'root' | 'trash';
  onOpenFile: (file: VirtualFile) => void;
  onDeleteFile: (id: string) => void;
  onRestoreFile: (id: string) => void;
}

export const Explorer: React.FC<ExplorerProps> = ({
  fileSystem,
  startPath,
  onOpenFile,
  onDeleteFile,
  onRestoreFile
}) => {
  const [activeFolder, setActiveFolder] = useState<FolderType>('root');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Sync with startPath prop changes
  useEffect(() => {
    if (startPath === 'trash') {
      setActiveFolder('trash');
    } else {
      setActiveFolder('root');
    }
  }, [startPath]);

  // Handle double clicking folders on root level
  const handleFolderDoubleClick = (folder: FolderType) => {
    setActiveFolder(folder);
    setSearchQuery('');
    setSelectedFileId(null);
  };

  // Get list of folders/files to render
  const renderItems = () => {
    if (activeFolder === 'root') {
      // Return root subfolders
      return [
        { id: 'dir_downloads', name: 'Downloads', type: 'directory', folderKey: 'downloads', icon: <Download className="text-blue-500 fill-blue-500/10" size={36} /> },
        { id: 'dir_documents', name: 'Documentos', type: 'directory', folderKey: 'documents', icon: <Folder className="text-yellow-500 fill-yellow-500/10" size={36} /> },
        { id: 'dir_desktop', name: 'Área de Trabalho', type: 'directory', folderKey: 'desktop', icon: <Folder className="text-amber-500 fill-amber-500/10" size={36} /> },
        { id: 'dir_trash', name: 'Lixeira', type: 'directory', folderKey: 'trash', icon: <Trash2 className="text-slate-400" size={36} /> }
      ];
    }

    // Filter files inside this specific virtual folder
    let folderFiles = fileSystem.filter(file => file.folder === activeFolder);
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      folderFiles = folderFiles.filter(file => file.name.toLowerCase().includes(query));
    }

    return folderFiles.map(file => {
      let icon = <File className="text-slate-400" size={36} />;
      if (file.type === 'csv') {
        icon = <FileSpreadsheet className="text-emerald-500 fill-emerald-500/5" size={36} />;
      } else if (file.type === 'doc') {
        icon = <FileText className="text-blue-500 fill-blue-500/5" size={36} />;
      }
      return {
        id: file.id,
        name: file.name,
        type: 'file',
        fileObj: file,
        icon
      };
    });
  };

  const currentItems = renderItems();

  const handleItemSelect = (id: string) => {
    setSelectedFileId(id === selectedFileId ? null : id);
  };

  const handleItemDoubleClick = (item: any) => {
    if (item.type === 'directory') {
      handleFolderDoubleClick(item.folderKey);
    } else if (item.type === 'file' && item.fileObj) {
      onOpenFile(item.fileObj);
    }
  };

  const formatFileDate = (dateVal: any) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Human-friendly title
  const getFolderTitle = () => {
    switch (activeFolder) {
      case 'root': return 'Este Computador';
      case 'downloads': return 'Downloads';
      case 'documents': return 'Documentos';
      case 'desktop': return 'Área de Trabalho';
      case 'trash': return 'Lixeira';
      default: return 'Arquivos';
    }
  };

  return (
    <div className="h-full bg-slate-900 text-slate-100 flex flex-col font-sans select-none border border-slate-700/50 rounded-lg overflow-hidden shadow-2xl">
      {/* Top Address Bar / Navigation */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-850 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => activeFolder !== 'root' && setActiveFolder('root')} 
            disabled={activeFolder === 'root'}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Voltar para Meu Computador"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Current Path Address Breadcrumb */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1 text-xs text-slate-400 flex items-center gap-1 font-mono">
          <HardDrive size={12} className="text-blue-400" />
          <span>Este Computador</span>
          <ChevronRight size={10} />
          <span className="text-white font-bold">{getFolderTitle()}</span>
        </div>

        {/* Search input (hidden on Root directory) */}
        {activeFolder !== 'root' && (
          <div className="relative w-48">
            <input 
              type="text"
              placeholder="Buscar nesta pasta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-xs border border-slate-800 rounded pl-8 pr-3 py-1.5 focus:border-blue-500 focus:outline-none placeholder-slate-500 font-mono"
            />
            <Search className="absolute left-2.5 top-2 text-slate-500" size={12} />
          </div>
        )}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <div className="w-52 bg-slate-950 border-r border-slate-850 p-3 space-y-1.5 shrink-0">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2.5 mb-2 font-mono">
            Locais Rápidos
          </div>
          {[
            { key: 'root', name: 'Este Computador', icon: <HardDrive size={15} /> },
            { key: 'downloads', name: 'Downloads', icon: <Download size={15} /> },
            { key: 'documents', name: 'Documentos', icon: <Folder size={15} /> },
            { key: 'trash', name: 'Lixeira', icon: <Trash2 size={15} /> }
          ].map(folder => (
            <button
              key={folder.key}
              onClick={() => {
                setActiveFolder(folder.key as FolderType);
                setSearchQuery('');
                setSelectedFileId(null);
              }}
              className={`w-full px-3 py-2 rounded-xl text-xs text-left font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                activeFolder === folder.key 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 font-semibold' 
                  : 'hover:bg-slate-900 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <span className={activeFolder === folder.key ? 'text-blue-400' : 'text-slate-500'}>
                {folder.icon}
              </span>
              <span>{folder.name}</span>
            </button>
          ))}
          
          <div className="pt-6 px-2 text-[10px] text-slate-500 leading-relaxed font-light">
            <Sparkles size={14} className="text-yellow-500 inline mr-1 mb-0.5 animate-pulse" />
            Clique duas vezes em um arquivo para abri-lo automaticamente no aplicativo correto.
          </div>
        </div>

        {/* File Grid pane */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-900/60 relative">
          {currentItems.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <Folder size={48} className="text-slate-700 stroke-[1.5] mb-3" />
              <h3 className="font-bold text-slate-400 text-sm">Esta pasta está vazia</h3>
              <p className="text-slate-500 text-xs mt-1 max-w-sm leading-relaxed">
                {activeFolder === 'trash' 
                  ? 'Nenhum item descartado na Lixeira no momento.' 
                  : 'Faça downloads das bases do DATASUS ou salve seus relatórios científicos no editor.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {currentItems.map((item: any) => {
                const isSelected = selectedFileId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    className={`p-4 rounded-2xl flex flex-col items-center text-center cursor-pointer transition-all border group relative ${
                      isSelected 
                        ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-600/5' 
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    {/* Visual Icon */}
                    <div className="w-16 h-16 bg-slate-950/40 rounded-xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>

                    {/* File / Folder Name */}
                    <span className="text-xs font-semibold text-slate-100 break-all line-clamp-2 leading-tight px-1 group-hover:text-white transition-colors">
                      {item.name}
                    </span>

                    {/* Metadata Subtitle */}
                    {item.type === 'file' && item.fileObj && (
                      <span className="text-[9px] text-slate-500 mt-1 font-mono">
                        {item.fileObj.type.toUpperCase()} • {formatFileDate(item.fileObj.createdAt)}
                      </span>
                    )}

                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === 'file' && (
                        <span className="text-[10px] text-slate-400">🔍</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Item Information Bar / Actions */}
      <div className="bg-slate-950 border-t border-slate-850 px-5 py-3.5 flex items-center justify-between shrink-0 text-xs text-slate-400">
        <div>
          {selectedFileId ? (
            (() => {
              const selectedItem = currentItems.find((item: any) => item.id === selectedFileId);
              if (!selectedItem) return <span>{fileSystem.length} arquivo(s) no total</span>;
              
              if (selectedItem.type === 'directory') {
                return <span className="font-semibold text-blue-400">Pasta: {selectedItem.name}</span>;
              }
              
              return (
                <div className="flex flex-col">
                  <span className="font-semibold text-white truncate max-w-md">{selectedItem.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Tamanho: {Math.floor(Math.random() * 8) + 2} KB | Criado em: {formatFileDate(selectedItem.fileObj?.createdAt)}
                  </span>
                </div>
              );
            })()
          ) : (
            <span>Selecione um arquivo ou pasta para ver mais ações</span>
          )}
        </div>

        {/* Actions Button Panel */}
        <div className="flex items-center gap-2">
          {selectedFileId && (() => {
            const selectedItem = currentItems.find((item: any) => item.id === selectedFileId);
            if (!selectedItem) return null;

            if (selectedItem.type === 'directory') {
              return (
                <button 
                  onClick={() => handleFolderDoubleClick(selectedItem.folderKey)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Entrar na Pasta
                </button>
              );
            }

            if (activeFolder === 'trash') {
              return (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      onRestoreFile(selectedItem.id);
                      setSelectedFileId(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Undo size={14} />
                    <span>Restaurar</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onOpenFile(selectedItem.fileObj)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                >
                  Abrir Arquivo
                </button>
                <button 
                  onClick={() => {
                    onDeleteFile(selectedItem.id);
                    setSelectedFileId(null);
                  }}
                  className="bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer border border-red-500/30"
                  title="Enviar para Lixeira"
                >
                  <Trash2 size={13} />
                  <span>Excluir</span>
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
