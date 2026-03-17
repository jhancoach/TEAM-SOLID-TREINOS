
import React, { useState, useRef } from 'react';
import { Shuffle, Camera, Loader2, Map as MapIcon, RotateCcw, Play, ChevronDown, RefreshCw, Trash2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useMatchStore, MAPS_DATABASE } from '../store';
import { MapInfo } from '../types';

export const MapPicker: React.FC = () => {
  const { mapSequence, availableMaps, updateMaps, resetMaps: storeResetMaps } = useMatchStore();
  const [isShuffling, setIsShuffling] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const removeMap = (index: number) => {
    if (isShuffling) return;
    const mapToRemove = mapSequence[index];
    const newSequence = [...mapSequence];
    newSequence.splice(index, 1);
    
    const isStillInSequence = newSequence.some(m => m.id === mapToRemove.id);
    const newAvailable = isStillInSequence ? availableMaps : [...availableMaps, mapToRemove];
    
    updateMaps(newSequence, newAvailable);
  };

  const reRollMap = (index: number) => {
    if (isShuffling) return;
    
    if (index >= 5) {
      setReplacingIndex(index);
      setShowDropdown(true);
      return;
    }
    
    if (availableMaps.length === 0) return;
    
    setIsShuffling(true);
    setTimeout(() => {
      const mapToRemove = mapSequence[index];
      const randomIndex = Math.floor(Math.random() * availableMaps.length);
      const newMap = availableMaps[randomIndex];
      
      const newAvailable = [...availableMaps];
      newAvailable.splice(randomIndex, 1);
      
      const isStillInSequence = mapSequence.filter((_, i) => i !== index).some(m => m.id === mapToRemove.id);
      if (!isStillInSequence) {
        newAvailable.push(mapToRemove);
      }
      
      const newSequence = [...mapSequence];
      newSequence[index] = newMap;
      
      updateMaps(newSequence, newAvailable);
      setIsShuffling(false);
    }, 600);
  };

  const sortNextMap = () => {
    if (availableMaps.length === 0) return;

    setIsShuffling(true);
    
    // Efeito de suspense antes de revelar o mapa
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableMaps.length);
      const selectedMap = availableMaps[randomIndex];
      
      const newSequence = [...mapSequence, selectedMap];
      const newAvailable = availableMaps.filter((_, idx) => idx !== randomIndex);
      
      updateMaps(newSequence, newAvailable);
      setIsShuffling(false);
    }, 800);
  };

  const selectSixthMap = (map: MapInfo) => {
    if (replacingIndex !== null) {
      const newSequence = [...mapSequence];
      newSequence[replacingIndex] = map;
      updateMaps(newSequence, availableMaps);
      setReplacingIndex(null);
    } else {
      const newSequence = [...mapSequence, map];
      updateMaps(newSequence, availableMaps);
    }
    setShowDropdown(false);
  };

  const handleReset = () => {
    if (isShuffling) return;
    if (confirm("Deseja resetar a sequência de mapas?")) {
      storeResetMaps();
    }
  };

  const handleCapture = async () => {
    if (!captureRef.current || mapSequence.length === 0) return;
    setIsCapturing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#2B2E34',
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-secondary/50 p-6 rounded-3xl border border-tertiary backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-tertiary rounded-2xl flex items-center justify-center border border-textMuted/20">
            <MapIcon className="text-accent" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-textMain uppercase tracking-tighter">Sorteio Individual</h2>
            <p className="text-xs text-textMuted font-bold uppercase tracking-widest">
              {mapSequence.length} de 6 Quedas Definidas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mapSequence.length < 5 ? (
            <button
              onClick={sortNextMap}
              disabled={isShuffling}
              className="flex items-center gap-3 px-6 py-3 bg-accent hover:bg-accent/80 text-primary font-bold text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-accent/20 border-b-4 border-accent/60 disabled:opacity-50"
            >
              {isShuffling ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
              SORTEAR {mapSequence.length + 1}ª QUEDA
            </button>
          ) : mapSequence.length === 5 ? (
            <>
              <button
                onClick={() => { setReplacingIndex(null); setShowDropdown(true); }}
                className="flex items-center gap-3 px-6 py-3 bg-accent hover:bg-accent/80 text-primary font-bold text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-lg shadow-accent/20 border-b-4 border-accent/60"
              >
                ESCOLHER 6ª QUEDA <ChevronDown size={16} />
              </button>
              
              {showDropdown && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setShowDropdown(false); setReplacingIndex(null); }}></div>
                  <div className="relative bg-secondary border border-tertiary rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 z-[10000]">
                    <div className="p-6 border-b border-tertiary/50">
                      <h3 className="text-xl font-heading font-bold text-textMain uppercase tracking-tighter">Escolha a 6ª Queda</h3>
                      <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">Selecione qual mapa irá repetir</p>
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
                      {MAPS_DATABASE.map(map => (
                        <button
                          key={map.id}
                          onClick={() => selectSixthMap(map)}
                          className="w-full text-left p-3 rounded-xl hover:bg-tertiary transition-all flex items-center gap-4 group border border-transparent hover:border-accent/30"
                        >
                          <img src={map.url} alt={map.name} className="w-16 h-12 rounded-lg object-cover border border-tertiary/50 group-hover:border-accent/50 transition-colors" />
                          <span className="text-base font-bold text-textMain group-hover:text-accent transition-colors">{map.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-4 border-t border-tertiary/50 flex justify-end">
                      <button 
                        onClick={() => { setShowDropdown(false); setReplacingIndex(null); }}
                        className="px-6 py-2 rounded-xl bg-tertiary text-textMuted font-bold text-xs uppercase tracking-widest hover:text-textMain transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="px-6 py-3 bg-tertiary text-textMuted font-bold text-xs uppercase tracking-widest rounded-2xl border border-textMuted/20 italic">
              SORTEIO FINALIZADO
            </div>
          )}

          <button
            onClick={handleReset}
            className="p-3 bg-secondary border border-tertiary text-textMuted hover:text-red-400 rounded-2xl transition-all active:scale-95"
            title="Resetar Sorteio"
          >
            <RotateCcw size={18} />
          </button>

          {mapSequence.length > 0 && (
            <button
              onClick={handleCapture}
              disabled={isCapturing}
              className="p-3 bg-tertiary border border-textMuted/20 text-textMuted hover:text-textMain rounded-2xl transition-all active:scale-95"
              title="Capturar Print"
            >
              {isCapturing ? <Loader2 className="animate-spin" size={18} /> : <Camera size={18} />}
            </button>
          )}
        </div>
      </div>

      <div ref={captureRef} className="p-4 rounded-[2.5rem] bg-primary/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => {
            const map = mapSequence[index];
            const isCurrentSorteando = isShuffling && index === mapSequence.length;
            const isChoosingSixth = !isShuffling && mapSequence.length === 5 && index === 5;

            return (
              <div 
                key={index}
                className={`
                  group relative overflow-hidden rounded-[2rem] border aspect-video transition-all duration-500
                  ${map 
                    ? 'border-tertiary bg-secondary shadow-2xl scale-100' 
                    : isCurrentSorteando 
                      ? 'border-accent/50 bg-secondary/50 animate-pulse'
                      : isChoosingSixth
                        ? 'border-accent/50 bg-secondary/30 border-dashed'
                        : 'border-tertiary/30 bg-transparent border-dashed'
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
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
                    
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-primary font-bold text-lg shadow-xl shadow-accent/40">
                        {index + 1}
                      </div>
                    </div>

                    {/* Ações da carta (Hover) */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                      {(index >= 5 || availableMaps.length > 0) && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); reRollMap(index); }}
                          disabled={isShuffling}
                          className="w-10 h-10 rounded-full bg-secondary/90 border border-tertiary flex items-center justify-center text-textMuted hover:text-accent hover:border-accent transition-colors backdrop-blur-md shadow-lg"
                          title="Refazer este mapa"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeMap(index); }}
                        disabled={isShuffling}
                        className="w-10 h-10 rounded-full bg-secondary/90 border border-tertiary flex items-center justify-center text-textMuted hover:text-red-400 hover:border-red-400 transition-colors backdrop-blur-md shadow-lg"
                        title="Remover este mapa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="absolute bottom-6 left-6 animate-in slide-in-from-left-4 duration-500">
                      <p className="text-[10px] text-accent font-bold uppercase tracking-[0.3em] mb-1">Queda Confirmada</p>
                      <h3 className="text-2xl font-heading font-bold text-textMain uppercase italic tracking-tighter">{map.name}</h3>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-tertiary">
                    {isCurrentSorteando ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-accent" size={32} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent/50">Sorteando...</span>
                      </div>
                    ) : isChoosingSixth ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full border-2 border-accent/50 flex items-center justify-center mb-2 bg-accent/10">
                          <span className="text-xl font-bold text-accent">6</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent">Aguardando Escolha</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full border-2 border-tertiary/50 flex items-center justify-center mb-2">
                          <span className="text-xl font-bold">{index + 1}</span>
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

      <div className="bg-secondary/30 border border-tertiary/50 rounded-2xl p-4 flex items-center justify-center gap-4">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent"></div>
            <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider">Mapas restantes no pool:</span>
         </div>
         <div className="flex gap-2">
            {availableMaps.map(m => (
              <span key={m.id} className="px-2 py-1 bg-tertiary rounded-md text-[9px] font-bold text-textMuted uppercase tracking-tighter">
                {m.id}
              </span>
            ))}
            {availableMaps.length === 0 && <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Nenhum - Todos sorteados</span>}
         </div>
      </div>
    </div>
  );
};
