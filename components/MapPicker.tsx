
import React, { useState, useRef } from 'react';
import { Shuffle, Camera, Loader2, Map as MapIcon, RotateCcw, Play } from 'lucide-react';
import html2canvas from 'html2canvas';

interface MapInfo {
  id: string;
  name: string;
  url: string;
}

const MAPS_DATABASE: MapInfo[] = [
  { id: 'BER', name: 'Bermuda', url: 'https://i.ibb.co/mrHhztmS/BERMUDA.png' },
  { id: 'ALP', name: 'Alpine', url: 'https://i.ibb.co/XZFNYHBG/ALPINE.png' },
  { id: 'PUR', name: 'Purgatório', url: 'https://i.ibb.co/gZ0Psrnh/PURGAT-RIO.png' },
  { id: 'NT', name: 'Nova Terra', url: 'https://i.ibb.co/ZR4tgkMx/NOVA-TERRA.png' },
  { id: 'KAL', name: 'Kalahari', url: 'https://i.ibb.co/XZNQ78r6/KALAHARI.png' },
  { id: 'SOL', name: 'Solara', url: 'https://i.ibb.co/j9bT8t3R/SOLARA.png' },
];

export const MapPicker: React.FC = () => {
  const [sequence, setSequence] = useState<MapInfo[]>([]);
  const [availableMaps, setAvailableMaps] = useState<MapInfo[]>([...MAPS_DATABASE]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const sortNextMap = () => {
    if (availableMaps.length === 0) return;

    setIsShuffling(true);
    
    // Efeito de suspense antes de revelar o mapa
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableMaps.length);
      const selectedMap = availableMaps[randomIndex];
      
      setSequence(prev => [...prev, selectedMap]);
      setAvailableMaps(prev => prev.filter((_, idx) => idx !== randomIndex));
      setIsShuffling(false);
    }, 800);
  };

  const resetMaps = () => {
    if (isShuffling) return;
    setSequence([]);
    setAvailableMaps([...MAPS_DATABASE]);
  };

  const handleCapture = async () => {
    if (!captureRef.current || sequence.length === 0) return;
    setIsCapturing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#09090b',
        scale: 2,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `team-solid-mapas-sequencia.png`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Erro ao capturar imagem.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
            <MapIcon className="text-yellow-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Sorteio Individual</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">
              {sequence.length} de 6 Quedas Definidas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {availableMaps.length > 0 ? (
            <button
              onClick={sortNextMap}
              disabled={isShuffling}
              className="flex items-center gap-3 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-yellow-500/20 border-b-4 border-yellow-700 disabled:opacity-50"
            >
              {isShuffling ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
              SORTEAR {sequence.length + 1}ª QUEDA
            </button>
          ) : (
            <div className="px-6 py-3 bg-zinc-800 text-zinc-400 font-black text-xs uppercase tracking-widest rounded-2xl border border-zinc-700 italic">
              SORTEIO FINALIZADO
            </div>
          )}

          <button
            onClick={resetMaps}
            className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 rounded-2xl transition-all active:scale-95"
            title="Resetar Sorteio"
          >
            <RotateCcw size={18} />
          </button>

          {sequence.length > 0 && (
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="p-3 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white rounded-2xl transition-all active:scale-95"
              title="Capturar Print"
            >
              {isCapturing ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
            </button>
          )}
        </div>
      </div>

      <div ref={captureRef} className="p-4 rounded-[2.5rem] bg-zinc-950/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Renderiza os 6 slots fixos */}
          {[...Array(6)].map((_, index) => {
            const map = sequence[index];
            const isCurrentSorteando = isShuffling && index === sequence.length;

            return (
              <div 
                key={index}
                className={`
                  group relative overflow-hidden rounded-[2rem] border aspect-video transition-all duration-500
                  ${map 
                    ? 'border-zinc-800 bg-zinc-900 shadow-2xl scale-100' 
                    : isCurrentSorteando 
                      ? 'border-yellow-500/50 bg-zinc-900/50 animate-pulse'
                      : 'border-zinc-800/30 bg-transparent border-dashed'
                  }
                `}
              >
                {map ? (
                  <>
                    <img 
                      src={map.url} 
                      alt={map.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-zinc-950 font-black text-lg shadow-xl shadow-yellow-500/40">
                        {index + 1}
                      </div>
                    </div>

                    <div className="absolute bottom-6 left-6 animate-in slide-in-from-left-4 duration-500">
                      <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.3em] mb-1">Queda Confirmada</p>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">{map.name}</h3>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-800">
                    {isCurrentSorteando ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-yellow-500" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500/50">Sorteando...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full border-2 border-zinc-800/50 flex items-center justify-center mb-2">
                          <span className="text-xl font-black">{index + 1}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Pendente</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 flex items-center justify-center gap-4">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mapas restantes no pool:</span>
         </div>
         <div className="flex gap-2">
            {availableMaps.map(m => (
              <span key={m.id} className="px-2 py-1 bg-zinc-800 rounded-md text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                {m.id}
              </span>
            ))}
            {availableMaps.length === 0 && <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter">Nenhum - Todos sorteados</span>}
         </div>
      </div>
    </div>
  );
};
