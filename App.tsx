
import React, { useState, useCallback } from 'react';
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
  ChevronRight,
  Zap,
  Map as MapIcon
} from 'lucide-react';
import { useMatchStore } from './store';
import { parseLogFile } from './parser';
import { TableCard } from './components/TableCard';
import { MapPicker } from './components/MapPicker';
import { Team, Player, Match } from './types';

interface MatchMVP extends Player {
  teamName: string;
  teamRank: number;
  participation: string;
}

const App: React.FC = () => {
  const { matches, addMatch, clearData, getGlobalTeamStats, getGlobalPlayerStats } = useMatchStore();
  const [activeTab, setActiveTab] = useState<'match' | 'global' | 'maps'>('global');
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
          setActiveTab('match');
        } else {
          alert("Nenhum dado válido encontrado no arquivo .log. Verifique a estrutura do texto.");
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
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 mt-1">Selo de Qualidade Competitiva</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className={`
              flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-2xl
              ${isUploading 
                ? 'bg-zinc-800 text-zinc-500 border border-zinc-700' 
                : 'bg-yellow-500 hover:bg-yellow-400 text-zinc-950 hover:shadow-yellow-500/30 border-b-4 border-yellow-700 hover:border-yellow-600'}
            `}>
              {isUploading ? <Zap className="animate-spin" size={20} /> : <Upload size={20} />}
              {isUploading ? 'PROCESSANDO...' : 'IMPORTAR LOG'}
              <input type="file" accept=".log,.txt" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
            
            <button 
              onClick={clearData}
              className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-500/50 transition-all shadow-xl"
              title="Limpar Histórico"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex bg-zinc-900/50 p-1.5 rounded-3xl w-fit mx-auto mb-12 border border-zinc-800 backdrop-blur-sm overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('global')}
            className={`flex items-center gap-3 px-6 md:px-8 py-4 rounded-2xl font-black text-xs tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'global' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Trophy size={18} /> GERAL
          </button>
          <button 
            onClick={() => setActiveTab('match')}
            className={`flex items-center gap-3 px-6 md:px-8 py-4 rounded-2xl font-black text-xs tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'match' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <HistoryIcon size={18} /> ÚLTIMA PARTIDA
          </button>
          <button 
            onClick={() => setActiveTab('maps')}
            className={`flex items-center gap-3 px-6 md:px-8 py-4 rounded-2xl font-black text-xs tracking-widest transition-all whitespace-nowrap ${
              activeTab === 'maps' ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <MapIcon size={18} /> MAPAS
          </button>
        </div>

        {activeTab === 'global' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <TableCard
              title="Classificação Acumulada"
              subtitle="O ranking definitivo dos melhores times"
              icon={<TrendingUp size={24} />}
              data={getGlobalTeamStats()}
              columns={[
                { header: 'Pos', accessor: (_, idx) => <span className="text-zinc-500 font-black">#{idx + 1}</span>, align: 'center' },
                { header: 'Time', accessor: (t) => <span className="uppercase font-bold text-zinc-200">{t.teamName}</span> },
                { header: 'PJ', accessor: (t) => t.matchesPlayed, align: 'center' },
                { header: 'Kills', accessor: (t) => t.totalKills, align: 'center' },
                { header: 'Média', accessor: (t) => t.averagePoints, align: 'center' },
                { header: 'Pontos', accessor: (t) => <span className="font-black text-yellow-400 text-lg">{t.totalPoints}</span>, align: 'right' },
              ]}
            />

            <TableCard
              title="MVP Rankings"
              subtitle="Líderes de abate da temporada"
              icon={<Users size={24} />}
              data={getGlobalPlayerStats()}
              columns={[
                { header: '#', accessor: (_, idx) => <span className="text-zinc-500">#{idx + 1}</span>, align: 'center' },
                { header: 'Jogador', accessor: (p) => <span className="font-bold text-zinc-100">{p.playerName}</span> },
                { header: 'Time', accessor: (p) => <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">{p.teamName}</span> },
                { header: 'Kills', accessor: (p) => <span className="font-black text-yellow-400 text-lg">{p.totalKills}</span>, align: 'right' },
              ]}
            />
          </div>
        )}

        {activeTab === 'match' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            {lastMatch ? (
              <>
                <div className="flex flex-col md:flex-row items-center justify-between bg-zinc-900/80 p-8 rounded-[2rem] border border-zinc-800 shadow-2xl gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
                      <Calendar className="text-yellow-400" size={32} />
                    </div>
                    <div>
                      <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.3em] mb-1">Status da Partida</p>
                      <h2 className="text-2xl font-black text-white">
                        {new Date(lastMatch.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às {new Date(lastMatch.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </h2>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-zinc-800 hidden md:block" />
                  <div className="flex flex-col items-center md:items-end">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Session Token</p>
                    <code className="text-xs text-zinc-400 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 font-mono tracking-tighter">
                      {lastMatch.id.slice(0, 18).toUpperCase()}...
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <TableCard
                      title="Performance da Rodada"
                      icon={<Shield size={20} />}
                      data={matchTeams}
                      columns={[
                        { header: 'Pos', accessor: (_, idx) => <span className="font-black">#{idx + 1}</span>, align: 'center' },
                        { header: 'Equipe', accessor: (t) => <span className="font-bold">{t.teamName}</span> },
                        { header: 'Kills', accessor: (t) => t.killScore, align: 'center' },
                        { header: 'Rank', accessor: (t) => <span className="text-zinc-500">{t.rankScore}</span>, align: 'center' },
                        { header: 'Total', accessor: (t) => <span className="font-black text-yellow-400 text-lg">{t.totalScore}</span>, align: 'right' },
                      ]}
                    />
                  </div>
                  <div className="lg:col-span-1">
                    <TableCard
                      title="MVPs Partida"
                      icon={<Sword size={20} />}
                      data={matchMVPs}
                      columns={[
                        { header: '#', accessor: (_, idx) => idx + 1, align: 'center' },
                        { header: 'Jogador', accessor: (p) => <div className="flex flex-col"><span className="font-bold">{p.name}</span><span className="text-[9px] uppercase text-zinc-600 font-black">{p.teamName}</span></div> },
                        { header: 'Abates', accessor: (p) => <span className="text-yellow-400 font-black">{p.kills}</span>, align: 'center' },
                        { header: '%', accessor: (p) => <span className="text-[10px] font-bold text-zinc-500">{p.participation}%</span>, align: 'right' },
                      ]}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-800/50">
                <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800 mb-6 animate-pulse">
                  <HistoryIcon size={40} className="text-zinc-700" />
                </div>
                <h3 className="text-2xl font-black text-zinc-400 uppercase tracking-tighter">Sala Vazia</h3>
                <p className="text-zinc-600 mt-2 font-medium">Importe o primeiro arquivo .log para ativar o sistema.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maps' && (
          <MapPicker />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/50 py-4 z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.4em] font-black">
            TEAM SOLID <span className="text-yellow-500/50">ANALYSIS TOOL</span>
          </p>
          <div className="flex gap-4 opacity-30 hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none">Sistema Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
