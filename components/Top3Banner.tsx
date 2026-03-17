import React, { useRef, useState } from 'react';
import { Trophy, Camera, Loader2, Crosshair } from 'lucide-react';
import html2canvas from 'html2canvas';
import { GlobalTeamStats } from '../types';

interface Top3BannerProps {
  data: GlobalTeamStats[];
}

export const Top3Banner: React.FC<Top3BannerProps> = ({ data }) => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const top3 = data.slice(0, 3);
  
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const handleCapture = async () => {
    if (!bannerRef.current) return;
    setIsCapturing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      const canvas = await html2canvas(bannerRef.current, {
        backgroundColor: '#09090b',
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `team-solid-top3.png`;
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
      <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-3xl p-20 text-center">
        <Trophy className="mx-auto text-zinc-700 mb-4" size={48} />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Aguardando dados para o Top 3</p>
      </div>
    );
  }

  const BannerItem = ({ team, position, height, colorClass, delay }: { team?: GlobalTeamStats, position: number, height: string, colorClass: string, delay: string }) => (
    <div className={`flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 ${delay} duration-700`}>
      <h3 className="text-white font-black text-lg md:text-xl mb-2 uppercase tracking-widest drop-shadow-md">
        {position}º LUGAR
      </h3>
      
      {/* Banner shape */}
      <div className={`relative w-40 md:w-56 ${height} bg-zinc-900 border-2 ${colorClass} shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-start pt-8 pb-12 px-4`}
           style={{
             clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)'
           }}>
        
        {/* Top rod decoration */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-1">
          <div className="w-3 h-3 rounded-full bg-zinc-700 -ml-2"></div>
          <div className="w-3 h-3 rounded-full bg-zinc-700 -mr-2"></div>
        </div>

        {team ? (
          <>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center mb-4 shadow-inner">
              <Trophy size={32} className={colorClass.replace('border-', 'text-')} />
            </div>
            
            <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter text-center mb-6 break-all line-clamp-2">
              {team.teamName}
            </h4>
            
            <div className="w-full space-y-3 mt-auto">
              <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800/50 flex flex-col items-center">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Pontos</span>
                <span className={`text-2xl md:text-3xl font-black ${colorClass.replace('border-', 'text-')}`}>{team.totalPoints}</span>
              </div>
              
              <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800/50 flex flex-col items-center">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Crosshair size={10} /> Abates
                </span>
                <span className="text-lg md:text-xl font-black text-zinc-300">{team.totalKills}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-zinc-700 font-black uppercase tracking-widest text-sm">Vazio</span>
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 font-black text-[10px] uppercase tracking-widest hover:text-yellow-400 hover:border-yellow-500/50 transition-all active:scale-95 shadow-xl"
        >
          {isCapturing ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {isCapturing ? 'CAPTURANDO...' : 'SALVAR BANNER'}
        </button>
      </div>

      <div 
        ref={bannerRef}
        className="relative bg-[#09090b] rounded-[2.5rem] border border-zinc-800/50 overflow-hidden p-8 md:p-16 flex flex-col items-center min-h-[600px]"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-zinc-900/40 to-[#09090b]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
        
        {/* Header */}
        <div className="relative z-10 text-center mb-16">
          <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            TOP 3
          </h2>
          <h3 className="text-3xl md:text-5xl font-black text-yellow-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(234,179,8,0.3)] mt-[-10px]">
            MELHORES
          </h3>
        </div>

        {/* Banners Container */}
        <div className="relative z-10 flex flex-col md:flex-row items-end justify-center gap-6 md:gap-12 w-full max-w-5xl mx-auto">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 mb-0 md:mb-8">
            <BannerItem 
              team={second} 
              position={2} 
              height="h-[380px] md:h-[420px]" 
              colorClass="border-zinc-400" 
              delay="delay-150"
            />
          </div>

          {/* 1st Place */}
          <div className="order-1 md:order-2 z-20">
            <BannerItem 
              team={first} 
              position={1} 
              height="h-[420px] md:h-[480px]" 
              colorClass="border-yellow-400" 
              delay="delay-0"
            />
          </div>

          {/* 3rd Place */}
          <div className="order-3 md:order-3 mb-0 md:mb-8">
            <BannerItem 
              team={third} 
              position={3} 
              height="h-[360px] md:h-[400px]" 
              colorClass="border-amber-700" 
              delay="delay-300"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-20 text-center">
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm md:text-base">
            AGRADECEMOS A TODAS
          </p>
          <p className="text-yellow-500 font-black uppercase tracking-widest text-lg md:text-xl">
            AS EQUIPES !!!
          </p>
        </div>
      </div>
    </div>
  );
};
