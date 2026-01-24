
import React, { useState } from 'react';
import { 
  Trophy, 
  Upload, 
  History as HistoryIcon, 
  Users, 
  TrendingUp, 
  Calendar,
  Sword,
  Shield,
  Trash2,
  Zap,
  Map as MapIcon,
  Crown,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { useMatchStore } from './store';
import { parseLogFile } from './parser';
import { TableCard } from './components/TableCard';
import { MapPicker } from './components/MapPicker';
import { Player } from './types';

interface MatchMVP extends Player {
  teamName: string;
  teamRank: number;
  participation: string;
}

type TabType = 'global-teams' | 'global-players' | 'match-teams' | 'match-players' | 'maps';

const App: React.FC = () => {
  const { matches, addMatch, resetMatches, clearData, getGlobalTeamStats, getGlobalPlayerStats } = useMatchStore();
  const [activeTab, setActiveTab] = useState<TabType>('global-teams');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsedTeams = parseLogFile(content);
        if (parsedTeams.length > 0) {
          addMatch(parsedTeams);
          setActiveTab('match-teams');
        } else {
          alert("Nenhum dado válido encontrado no arquivo .log.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro crítico ao processar o arquivo.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  const lastMatch = matches.length > 0 ? matches[matches.length - 1] : null;

  const matchTeams = lastMatch ? [...lastMatch.teams].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.killScore !== a.killScore) return b.killScore - a.killScore;
    return a.rank - b.rank;
  }) : [];

  const matchMVPs: MatchMVP[] = lastMatch ? lastMatch.teams.flatMap(t => t.players.map(p => ({
    ...p,
    teamName: t.teamName,
    teamRank: t.rank,
    participation: t.killScore > 0 ? ((p.kills / t.killScore) * 100).toFixed(1) : '0'
  }))).sort((a, b) => {
    if (b.kills !== a.kills) return b.kills - a.kills;
    return a.teamRank - b.teamRank;
  }) : [];

  return (
    <div className="min-h-screen pb-24 selection:bg-yellow-400 selection:text-zinc-900">
      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)] rotate-3">
              <Shield className="text-zinc-950" size={28} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
                Treinos <span className="text-yellow-400">Team Solid</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 mt-1">Dashboard de Performance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={resetMatches}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 hover:border-zinc-700 transition-all active:scale-95 shadow-xl"
            >
              <RotateCcw size={16} className="text-zinc-500" />
              NOVO TREINO
            </button>

            <label className={`
              flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-2xl
              ${isUploading 
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-zinc-950 hover:shadow-yellow-500/30 border-b-4 border-yellow-700 hover:border-yellow-600'}
            `}>
              {isUploading ? <Zap className="animate-spin" size={16} /> : <Upload size={16} />}
              {isUploading ? 'LENDO...' : 'IMPORTAR LOG'}
              <input type="file" accept=".log,.txt" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
            
            <button 
              onClick={clearData}
              className="p-3 rounded-2xl bg-zinc-950 border border-zinc-900 text-zinc-700 hover:text-red-500 transition-all active:scale-95 group relative"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-10">
        <nav className="flex bg-zinc-900/50 p-1.5 rounded-3xl w-fit mx-auto mb-12 border border-zinc-800 backdrop-blur-sm overflow-x-auto max-w-full no-scrollbar">
          <button onClick={() => setActiveTab('global-teams')} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-[10px] tracking-widest transition-all ${activeTab === 'global-teams' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Trophy size={14} /> RANKING GERAL
          </button>
          <button onClick={() => setActiveTab('global-players')} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-[10px] tracking-widest transition-all ${activeTab === 'global-players' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Users size={14} /> TOP FRAGGERS
          </button>
          <button onClick={() => setActiveTab('match-teams')} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-[10px] tracking-widest transition-all ${activeTab === 'match-teams' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <TrendingUp size={14} /> ÚLTIMA RODADA
          </button>
          <button onClick={() => setActiveTab('match-players')} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-[10px] tracking-widest transition-all ${activeTab === 'match-players' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <UserCheck size={14} /> MVPs RODADA
          </button>
          <button onClick={() => setActiveTab('maps')} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-[10px] tracking-widest transition-all ${activeTab === 'maps' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <MapIcon size={14} /> MAPAS
          </button>
        </nav>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {activeTab === 'global-teams' && (
            <TableCard
              title="Classificação Geral"
              subtitle="Desempenho acumulado"
              icon={<Trophy size={20} />}
              data={getGlobalTeamStats()}
              columns={[
                { header: 'POS', accessor: (_, idx) => <span className="text-zinc-600 font-black">#{idx + 1}</span>, align: 'center', width: '45px' },
                { header: 'TIME', accessor: (t) => <span className="uppercase font-bold text-zinc-100 text-[12px]">{t.teamName}</span> },
                { header: 'PJ', accessor: (t) => <span className="text-zinc-500 font-bold">{t.matchesPlayed}</span>, align: 'center', width: '40px' },
                { header: 'B', accessor: (t) => (
                  <div className="flex items-center justify-center gap-1">
                    <span className={`font-black ${t.totalBooyahs > 0 ? 'text-yellow-400' : 'text-zinc-700'}`}>{t.totalBooyahs}</span>
                    {t.totalBooyahs > 0 && <Crown size={10} className="text-yellow-500" />}
                  </div>
                ), align: 'center', width: '40px' },
                { header: 'K', accessor: (t) => <span className="text-zinc-300 font-bold">{t.totalKills}</span>, align: 'center', width: '40px' },
                { header: '% ABTS', accessor: (t) => (
                  <span className="text-[10px] text-zinc-500 font-bold">
                    {t.totalPoints > 0 ? ((t.totalKills / t.totalPoints) * 100).toFixed(0) : 0}%
                  </span>
                ), align: 'center', width: '55px' },
                { header: 'PTS POS', accessor: (t) => <span className="text-zinc-400 font-bold">{t.totalRankPoints}</span>, align: 'center', width: '60px' },
                { header: '% POS', accessor: (t) => (
                  <span className="text-[10px] text-zinc-500 font-bold">
                    {t.totalPoints > 0 ? ((t.totalRankPoints / t.totalPoints) * 100).toFixed(0) : 0}%
                  </span>
                ), align: 'center', width: '55px' },
                { header: 'PONTOS', accessor: (t) => <span className="font-black text-yellow-400 text-lg tracking-tighter">{t.totalPoints}</span>, align: 'center', width: '75px' },
              ]}
            />
          )}

          {activeTab === 'global-players' && (
            <TableCard
              title="Top Fraggers"
              subtitle="Líderes de abates"
              icon={<Users size={20} />}
              data={getGlobalPlayerStats()}
              columns={[
                { header: 'POS', accessor: (_, idx) => <span className="text-zinc-600 font-black">#{idx + 1}</span>, align: 'center', width: '45px' },
                { header: 'JOGADOR', accessor: (p) => <span className="font-bold text-zinc-100">{p.playerName}</span> },
                { header: 'TIME', accessor: (p) => <span className="text-[9px] font-black uppercase text-zinc-600 truncate">{p.teamName}</span> },
                { header: 'PJ', accessor: (p) => <span className="text-zinc-500">{p.matchesPlayed}</span>, align: 'center', width: '40px' },
                { header: 'MÉDIA', accessor: (p) => <span className="text-zinc-600 text-[10px] font-black">{p.averageKills}</span>, align: 'center', width: '60px' },
                { header: 'K', accessor: (p) => <span className="font-black text-yellow-400 text-lg">{p.totalKills}</span>, align: 'center', width: '80px' },
              ]}
            />
          )}

          {activeTab === 'match-teams' && (
            <div className="space-y-4">
              {lastMatch ? (
                <>
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-yellow-500" size={18} />
                      <p className="font-black text-white text-[11px] uppercase tracking-widest">{new Date(lastMatch.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mr-2">EQUIPES NA SALA:</span>
                      <span className="font-black text-yellow-500 text-base">{lastMatch.teams.length}</span>
                    </div>
                  </div>
                  <TableCard
                    title="Resultado da Rodada"
                    icon={<Shield size={20} />}
                    data={matchTeams}
                    columns={[
                      { header: 'RANK', accessor: (t) => (
                         <div className="flex items-center gap-1 justify-center">
                           <span className={`font-black ${t.rank === 1 ? 'text-yellow-400' : 'text-zinc-600'}`}>#{t.rank}</span>
                           {t.rank === 1 && <Crown size={10} className="text-yellow-500" />}
                         </div>
                      ), align: 'center', width: '45px' },
                      { header: 'EQUIPE', accessor: (t) => (
                        <div className="flex flex-col leading-tight">
                          <span className={`font-bold uppercase text-[12px] tracking-tight ${t.rank === 1 ? 'text-yellow-400' : 'text-zinc-100'}`}>{t.teamName}</span>
                          {t.rank === 1 && <span className="text-[7px] font-black text-yellow-600 tracking-widest">BOOYAH!</span>}
                        </div>
                      ) },
                      { header: 'K', accessor: (t) => t.killScore, align: 'center', width: '40px' },
                      { header: '% ABTS', accessor: (t) => (
                        <span className="text-[10px] text-zinc-500 font-bold">
                          {t.totalScore > 0 ? ((t.killScore / t.totalScore) * 100).toFixed(0) : 0}%
                        </span>
                      ), align: 'center', width: '55px' },
                      { header: 'PTS RANK', accessor: (t) => <span className="text-zinc-400 font-bold">{t.rankScore}</span>, align: 'center', width: '60px' },
                      { header: '% POS', accessor: (t) => (
                        <span className="text-[10px] text-zinc-500 font-bold">
                          {t.totalScore > 0 ? ((t.rankScore / t.totalScore) * 100).toFixed(0) : 0}%
                        </span>
                      ), align: 'center', width: '55px' },
                      { header: 'PONTOS', accessor: (t) => <span className={`font-black text-lg tracking-tighter ${t.rank === 1 ? 'text-yellow-400' : 'text-white'}`}>{t.totalScore}</span>, align: 'center', width: '75px' },
                    ]}
                  />
                </>
              ) : (
                <EmptyState icon={<HistoryIcon />} text="Nenhum treino importado ainda" />
              )}
            </div>
          )}

          {activeTab === 'match-players' && (
            <div className="space-y-4">
              {lastMatch ? (
                <TableCard
                  title="Destaques / MVPs"
                  icon={<Sword size={20} />}
                  data={matchMVPs}
                  columns={[
                    { header: 'POS', accessor: (_, idx) => <span className="text-zinc-600 font-black">#{idx + 1}</span>, align: 'center', width: '45px' },
                    { header: 'JOGADOR', accessor: (p) => <span className="font-bold text-zinc-100">{p.name}</span> },
                    { header: 'TIME', accessor: (p) => <span className="text-[9px] font-black uppercase text-zinc-600 truncate">{p.teamName}</span> },
                    { header: '% TIME', accessor: (p) => <span className="text-[10px] text-zinc-600 font-black">{p.participation}%</span>, align: 'center', width: '60px' },
                    { header: 'K', accessor: (p) => <span className="font-black text-yellow-400 text-lg">{p.kills}</span>, align: 'center', width: '80px' },
                  ]}
                />
              ) : (
                <EmptyState icon={<Users />} text="Importe um log para ver os MVPs" />
              )}
            </div>
          )}

          {activeTab === 'maps' && <MapPicker />}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/50 py-3 z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-black">
            TEAM SOLID <span className="text-yellow-500/30 underline">ANALYTICS v3</span>
          </p>
          <div className="hidden md:flex gap-4 opacity-40">
             <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Calculando rendimento acumulado no ranking geral</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const EmptyState = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/10 rounded-[2.5rem] border-2 border-dashed border-zinc-800/30">
    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mb-4 text-zinc-700">
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <h3 className="text-sm font-black text-zinc-600 uppercase tracking-widest">{text}</h3>
  </div>
);

export default App;
