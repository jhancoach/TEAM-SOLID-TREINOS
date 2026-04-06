import React from 'react';
import { GlobalTeamStats } from '../types';
import { Trophy, Sword, Crown } from 'lucide-react';

interface Top3SummaryCardsProps {
  data: GlobalTeamStats[];
  rankingMode?: 'standard' | 'position-only';
}

export const Top3SummaryCards: React.FC<Top3SummaryCardsProps> = ({ data, rankingMode = 'standard' }) => {
  if (!data || data.length === 0) return null;

  const topByRankPoints = [...data].sort((a, b) => b.totalRankPoints - a.totalRankPoints).slice(0, 3);
  const topByKills = [...data].sort((a, b) => b.totalKills - a.totalKills).slice(0, 3);
  const topByBooyahs = [...data].sort((a, b) => b.totalBooyahs - a.totalBooyahs).slice(0, 3);

  const renderCard = (title: string, icon: React.ReactNode, teams: GlobalTeamStats[], metric: keyof GlobalTeamStats, label: string) => (
    <div className="bg-secondary/50 border border-tertiary rounded-2xl p-5 backdrop-blur-sm flex-1 min-w-[280px] hover:border-accent/30 transition-all group">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-accent/10 rounded-xl text-accent group-hover:bg-accent/20 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em] mb-0.5">{title}</h3>
          <p className="text-xs font-bold text-textMain uppercase tracking-widest">Liderança</p>
        </div>
      </div>
      <div className="space-y-4">
        {teams.map((team, idx) => (
          <div key={team.teamName} className="flex items-center justify-between group/item">
            <div className="flex items-center gap-4">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                idx === 0 ? 'bg-accent/20 border-accent/50 text-accent' : 
                idx === 1 ? 'bg-slate-500/10 border-slate-500/30 text-slate-300' : 
                'bg-orange-500/10 border-orange-500/30 text-orange-400'
              }`}>
                {idx + 1}
              </div>
              <span className="text-xs font-bold text-textMain uppercase truncate max-w-[140px] group-hover/item:text-accent transition-colors">
                {team.teamName}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-accent tracking-tighter">
                {team[metric]}
              </span>
              <span className="text-[8px] text-textMuted uppercase font-bold ml-1 tracking-widest">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      {renderCard('Pontos de Posição', <Trophy size={20} />, topByRankPoints, 'totalRankPoints', 'pts')}
      {rankingMode !== 'position-only' && renderCard('Total de Abates', <Sword size={20} />, topByKills, 'totalKills', 'kills')}
      {renderCard('Total de Booyahs', <Crown size={20} />, topByBooyahs, 'totalBooyahs', 'booyahs')}
    </div>
  );
};
