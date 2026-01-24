
import React, { useRef, useState } from 'react';
import { Camera, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Column<T> {
  header: string;
  accessor: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface TableCardProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  icon?: React.ReactNode;
}

export const TableCard = <T,>({ title, subtitle, data, columns, icon }: TableCardProps<T>) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cardRef.current || data.length === 0) return;
    
    setIsCapturing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#09090b',
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `team-solid-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (error) {
      console.error("Erro ao gerar print:", error);
      alert("Não foi possível gerar a imagem.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div 
      ref={cardRef}
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm transition-all hover:border-yellow-500/30 shadow-xl flex flex-col h-full"
    >
      <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-black text-white flex items-center gap-2 truncate uppercase tracking-tighter">
            {icon && <span className="text-yellow-400 flex-shrink-0">{icon}</span>}
            <span className="truncate">{title}</span>
          </h3>
          {subtitle && <p className="text-[9px] text-zinc-500 mt-0.5 uppercase font-black tracking-[0.2em] truncate">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0" data-html2canvas-ignore>
          <button 
            onClick={handleCapture}
            disabled={isCapturing || data.length === 0}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-95
              ${data.length === 0 
                ? 'bg-zinc-800/30 border-zinc-800 text-zinc-700 cursor-not-allowed' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-yellow-400 hover:border-yellow-500/50 shadow-lg'}
            `}
          >
            {isCapturing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                <Camera size={12} />
                <span className="text-[9px] font-black tracking-widest uppercase">Print</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-zinc-950/80">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-2 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: col.width || 'auto' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/30">
            {data.length > 0 ? (
              data.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-yellow-500/[0.02] transition-colors">
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={`px-2 py-3 text-[12px] font-bold whitespace-nowrap ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      } ${rowIdx === 0 && colIdx === 1 ? 'text-yellow-400' : 'text-zinc-400'}`}
                    >
                      {col.accessor(item, rowIdx)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center text-[10px] font-black uppercase text-zinc-700 tracking-widest">
                  Aguardando dados...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
