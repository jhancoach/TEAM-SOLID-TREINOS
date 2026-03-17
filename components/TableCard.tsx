
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
        backgroundColor: '#2B2E34',
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
      className="bg-secondary/50 border border-tertiary rounded-2xl overflow-hidden backdrop-blur-sm transition-all hover:border-accent/30 shadow-xl flex flex-col h-full"
    >
      <div className="p-4 md:p-5 border-b border-tertiary flex items-center justify-between bg-secondary/80 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-heading font-bold text-textMain flex items-center gap-2 truncate uppercase tracking-tighter">
            {icon && <span className="text-accent flex-shrink-0">{icon}</span>}
            <span className="truncate">{title}</span>
          </h3>
          {subtitle && <p className="text-[9px] text-textMuted mt-0.5 uppercase font-bold tracking-[0.2em] truncate">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0" data-html2canvas-ignore>
          <button 
            onClick={handleCapture}
            disabled={isCapturing || data.length === 0}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all active:scale-95
              ${data.length === 0 
                ? 'bg-tertiary/30 border-tertiary text-tertiary cursor-not-allowed' 
                : 'bg-tertiary border-tertiary text-textMuted hover:text-accent hover:border-accent/50 shadow-lg'}
            `}
          >
            {isCapturing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <>
                <Camera size={12} />
                <span className="text-[9px] font-bold tracking-widest uppercase">Print</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-primary/80">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-2 py-3 text-[9px] font-bold text-textMuted uppercase tracking-widest border-b border-tertiary ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={{ width: col.width || 'auto' }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-tertiary/30">
            {data.length > 0 ? (
              data.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-accent/[0.02] transition-colors">
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={`px-2 py-3 text-[12px] font-bold whitespace-nowrap ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      } ${rowIdx === 0 && colIdx === 1 ? 'text-accent' : 'text-textMuted'}`}
                    >
                      {col.accessor(item, rowIdx)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center text-[10px] font-bold uppercase text-tertiary tracking-widest">
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
