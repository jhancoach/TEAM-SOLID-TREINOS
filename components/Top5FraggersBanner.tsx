import React, { useRef, useState } from 'react';
import { Users, Camera, Loader2, Crosshair, Activity, Hash } from 'lucide-react';
import html2canvas from 'html2canvas';
import { GlobalPlayerStats } from '../types';

interface Top5FraggersBannerProps {
  data: GlobalPlayerStats[];
}

export const Top5FraggersBanner: React.FC<Top5FraggersBannerProps> = ({ data }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const top5 = data.slice(0, 5);

  const handleCapture = async () => {
    if (!bannerRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const canvas = await html2canvas(bannerRef.current, {
        backgroundColor: '#2B2E34',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `team-solid-top5-fraggers.png`;
      link.click();
    } catch (error) {
      console.error("Erro ao gerar print:", error);
      alert("Não foi possível gerar a imagem.");
    } finally {
      setIsCapturing(false);
    }
  };

  if (data.length === 0) {
    return (
      <div className="bg-secondary/30 border-2 border-dashed border-tertiary rounded-3xl p-20 text-center">
        <Users className="mx-auto text-tertiary mb-4" size={48} />
        <p className="text-textMuted font-bold uppercase tracking-widest text-xs">Aguardando dados para o Top 5</p>
      </div>
    );
  }

  const BannerItem = ({ player, position, height, colorClass, delay, isCenter = false }: { player?: GlobalPlayerStats, position: number, height: string, colorClass: string, delay: string, isCenter?: boolean }) => (
    <div className={`flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 ${delay} duration-700`}>
      <h3 className="text-textMain font-heading font-bold text-sm md:text-base mb-2 uppercase tracking-widest drop-shadow-md">
        {position}º LUGAR
      </h3>
      
      {/* Banner shape */}
      <div className={`relative w-32 md:w-44 ${height} bg-secondary border-2 ${colorClass} shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start pt-6 pb-8 px-3`}
           style={{
             clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)'
           }}>
        
        {/* Top rod decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-primary border-b border-tertiary flex items-center justify-between px-1">
          <div className="w-2 h-2 rounded-full bg-tertiary -ml-1"></div>
          <div className="w-2 h-2 rounded-full bg-tertiary -mr-1"></div>
        </div>

        {player ? (
          <>
            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary border-2 border-tertiary flex items-center justify-center mb-3 shadow-inner ${isCenter ? 'md:w-20 md:h-20' : ''}`}>
              <Crosshair size={isCenter ? 32 : 24} className={colorClass.replace('border-', 'text-')} />
            </div>
            
            <h4 className={`font-heading font-bold text-textMain uppercase tracking-tighter text-center mb-1 break-all line-clamp-2 ${isCenter ? 'text-lg md:text-xl' : 'text-base md:text-lg'}`}>
              {player.playerName}
            </h4>
            <p className="text-[9px] md:text-[10px] text-textMuted font-bold uppercase tracking-widest mb-4 truncate w-full text-center">
              {player.teamName}
            </p>
            
            <div className="w-full space-y-2 mt-auto">
              <div className="bg-primary/50 rounded-xl p-2 border border-tertiary/50 flex flex-col items-center">
                <span className="text-[9px] text-textMuted font-bold uppercase tracking-widest mb-0.5">Kills</span>
                <span className={`text-xl md:text-2xl font-bold ${colorClass.replace('border-', 'text-')}`}>{player.totalKills}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-primary/50 rounded-xl p-2 border border-tertiary/50 flex flex-col items-center">
                  <span className="text-[8px] text-textMuted font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                    <Hash size={8} /> Quedas
                  </span>
                  <span className="text-sm md:text-base font-bold text-textMain">{player.matchesPlayed}</span>
                </div>
                <div className="bg-primary/50 rounded-xl p-2 border border-tertiary/50 flex flex-col items-center">
                  <span className="text-[8px] text-textMuted font-bold uppercase tracking-widest mb-0.5 flex items-center gap-1">
                    <Activity size={8} /> Média
                  </span>
                  <span className="text-sm md:text-base font-bold text-textMain">{player.averageKills}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-tertiary font-bold uppercase tracking-widest text-xs">Vazio</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={handleCapture}
          disabled={isCapturing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-tertiary text-textMuted font-bold text-[10px] uppercase tracking-widest hover:text-accent hover:border-accent/50 transition-all active:scale-95 shadow-xl"
        >
          {isCapturing ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {isCapturing ? 'CAPTURANDO...' : 'SALVAR BANNER'}
        </button>
      </div>

      <div 
        ref={bannerRef}
        className="relative bg-primary rounded-[2.5rem] border border-tertiary/50 overflow-hidden p-6 md:p-12 flex flex-col items-center min-h-[600px]"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-tertiary/20 via-secondary/40 to-primary"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
        
        {/* Header */}
        <div className="relative z-10 text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-textMain italic tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            TOP 5
          </h2>
          <h3 className="text-2xl md:text-4xl font-heading font-bold text-textMuted uppercase tracking-widest drop-shadow-[0_0_15px_rgba(161,161,170,0.3)] mt-[-5px]">
            FRAGGERS
          </h3>
        </div>

        {/* Banners Container */}
        <div className="relative z-10 flex flex-wrap justify-center items-end gap-4 md:gap-6 w-full max-w-6xl mx-auto mt-8">
          {/* 4th Place */}
          <div className="order-4 md:order-1 mb-0 md:mb-4">
            <BannerItem 
              player={top5[3]} 
              position={4} 
              height="h-[300px] md:h-[340px]" 
              colorClass="border-tertiary" 
              delay="delay-300"
            />
          </div>

          {/* 2nd Place */}
          <div className="order-2 md:order-2 mb-0 md:mb-8">
            <BannerItem 
              player={top5[1]} 
              position={2} 
              height="h-[340px] md:h-[380px]" 
              colorClass="border-textMuted" 
              delay="delay-150"
            />
          </div>

          {/* 1st Place */}
          <div className="order-1 md:order-3 z-20">
            <BannerItem 
              player={top5[0]} 
              position={1} 
              height="h-[380px] md:h-[440px]" 
              colorClass="border-accent" 
              delay="delay-0"
              isCenter={true}
            />
          </div>

          {/* 3rd Place */}
          <div className="order-3 md:order-4 mb-0 md:mb-8">
            <BannerItem 
              player={top5[2]} 
              position={3} 
              height="h-[320px] md:h-[360px]" 
              colorClass="border-accent/60" 
              delay="delay-200"
            />
          </div>

          {/* 5th Place */}
          <div className="order-5 md:order-5 mb-0 md:mb-4">
            <BannerItem 
              player={top5[4]} 
              position={5} 
              height="h-[280px] md:h-[320px]" 
              colorClass="border-tertiary/60" 
              delay="delay-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-16 text-center">
          <p className="text-textMuted font-bold uppercase tracking-widest text-xs md:text-sm">
            OS MAIORES ABATEDORES
          </p>
          <p className="text-textMain font-heading font-bold uppercase tracking-widest text-base md:text-lg">
            DO TREINO !!!
          </p>
        </div>
      </div>
    </div>
  );
};
