
import React, { useRef, useState } from 'react';
import { Camera, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Column<T> {
  header: string;
  accessor: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
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
      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm transition-all hover:border-yellow-500/30 shadow-xl"
    >
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-zinc-900 to-transparent">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {icon && <span className="text-yellow-400">{icon}</span>}
            {title}
          </h3>
          {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden lg:block px-3 py-1 bg-zinc-800/50 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-400 border border-zinc-700">
            {data.length} ITENS
          </div>
          
          <button 
            onClick={handleCapture}
            disabled={isCapturing || data.length === 0}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl border transition-all active:scale-95
              ${data.length === 0 
                ? 'bg-zinc-800/30 border-zinc-800 text-zinc-600 cursor-not-allowed' 
                : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-yellow-400 hover:border-yellow-500/50 shadow-lg'}
            `}
            title="Salvar Tabela como Imagem"
            data-html2canvas-ignore
          >
            {isCapturing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Camera size={16} />
                <span className="text-[10px] font-black tracking-tighter uppercase">Print</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-950/50 text-nowrap">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-6 py-4 text-[10px] font-black text-yellow-500/80 uppercase tracking-[0.15em] border-b border-zinc-800 ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/30">
            {data.length > 0 ? (
              data.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-yellow-500/[0.02] transition-colors group">
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      } ${rowIdx === 0 && colIdx === 0 ? 'text-yellow-400 font-black' : 'text-zinc-300'}`}
                    >
                      {col.accessor(item, rowIdx)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <Camera size={40} className="text-zinc-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Sem dados para exibir</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
