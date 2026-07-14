import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';

export const WindowFrame = ({ 
  windowState, 
  onClose, 
  onMinimize, 
  onMaximize, 
  onFocus, 
  onMove, 
  icon, 
  children 
}: any) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Focus the window on click
    onFocus();
    
    // Do not initiate drag if user clicks on window controls
    if ((e.target as HTMLElement).closest('.win-control-btn')) {
      return;
    }

    if (isMobile) return;

    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { x: windowState.position.x, y: windowState.position.y };
    e.preventDefault();
  };

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const syncViewport = () => setIsMobile(media.matches);
    syncViewport();
    media.addEventListener('change', syncViewport);
    return () => media.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      
      // Keep within viewport boundaries
      const newX = Math.max(0, Math.min(window.innerWidth - 150, positionStart.current.x + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - 50, positionStart.current.y + dy));
      
      onMove(newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onMove]);

  // If maximized, occupy full viewport below topbar or general container
  const windowStyles: React.CSSProperties = isMobile
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100dvh - 48px)',
        zIndex: windowState.zIndex,
        display: !windowState.isOpen || windowState.isMinimized ? 'none' : 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
      }
    : windowState.isMaximized
    ? {
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: '100%',
        height: 'calc(100vh - 40px)', // adjusted for taskbar/system bar if any
        zIndex: windowState.zIndex,
        display: !windowState.isOpen || windowState.isMinimized ? 'none' : 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
      }
    : {
        position: 'absolute',
        top: `${windowState.position.y}px`,
        left: `${windowState.position.x}px`,
        width: typeof windowState.size.width === 'number' ? `${windowState.size.width}px` : windowState.size.width,
        height: typeof windowState.size.height === 'number' ? `${windowState.size.height}px` : windowState.size.height,
        zIndex: windowState.zIndex,
        display: !windowState.isOpen || windowState.isMinimized ? 'none' : 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
      };

  return (
    <div 
      style={windowStyles}
      className="bg-white border border-slate-300 rounded-none md:rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col font-sans pointer-events-auto"
      onMouseDown={onFocus}
    >
      {/* Title Bar / Header */}
      <div 
        className="bg-slate-900 border-b border-slate-800 text-slate-200 px-3 md:px-4 py-2.5 flex items-center justify-between select-none md:cursor-move shrink-0 active:bg-slate-950 transition-colors"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wide">
          <span className="text-blue-400 shrink-0">{icon}</span>
          <span className="truncate text-slate-100 max-w-[200px] md:max-w-md">{windowState.title}</span>
        </div>

        {/* Window Controls (Mac Style Circles) */}
        <div className="flex items-center gap-2">
          {/* Minimize */}
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }} 
            className="win-control-btn w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition-all shadow-sm border border-slate-700/50"
            title="Minimizar"
          >
            <Minus size={11} strokeWidth={2.5} />
          </button>
          
          {/* Maximize */}
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(); }} 
            className="win-control-btn w-6 h-6 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-green-400 transition-all shadow-sm border border-slate-700/50"
            title={windowState.isMaximized ? "Restaurar" : "Maximizar"}
          >
            <Square size={9} strokeWidth={2.5} />
          </button>

          {/* Close */}
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }} 
            className="win-control-btn w-6 h-6 rounded-full flex items-center justify-center bg-rose-950/40 hover:bg-red-600 text-rose-400 hover:text-white transition-all shadow-sm border border-red-900/30"
            title="Fechar"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-hidden relative bg-slate-50">
        {children}
      </div>
    </div>
  );
};
