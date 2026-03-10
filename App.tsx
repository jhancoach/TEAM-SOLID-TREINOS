
import React, { useState } from 'react';
import { 
  Trophy, Upload, History as HistoryIcon, Users, TrendingUp, Calendar, Sword, Shield, Trash2, Zap, Map as MapIcon, Crown, RotateCcw, UserCheck, Share2, Globe, Cloud, Loader2, Copy, ListOrdered
} from 'lucide-react';
import { useMatchStore } from './store';
import { parseLogFile } from './parser';
import { TableCard } from './components/TableCard';
import { MapPicker } from './components/MapPicker';
import { Player, Team } from './types';

interface MatchMVP extends Player {
  teamName: string;
  teamRank: number;
  participation: string;
}

type TabType = 'global-teams' | 'global-players' | 'match-teams' | 'match-players' | 'match-history' | 'maps';

const App: React.FC = () => {
  const { matches, addMatch, resetMatches, clearData, getGlobalTeamStats, getGlobalPlayerStats, createRoom, roomID, isLoading } = useMatchStore();
  const [activeTab, setActiveTab] = useState<TabType>('global-teams');
  const [isUploading, setIsUploading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
        } else alert("Nenhum dado válido encontrado no log.");
      } catch (err) { alert("Erro ao processar o arquivo de log."); }
      finally { setIsUploading(false); }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };

  const handleShare = async () => {
    const link = await createRoom();
    if (link) {
      navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  const lastMatch = matches.length > 0 ? matches[matches.length - 1] : null;
  const matchTeams = lastMatch ? [...lastMatch.teams].sort((a, b) => b.totalScore - a.totalScore || a.rank - b.rank) : [];
  const matchMVPs: MatchMVP[] = lastMatch ? lastMatch.teams.flatMap(t => t.players.map(p => ({
    ...p, teamName: t.teamName, teamRank: t.rank, participation: t.killScore > 0 ? ((p.kills / t.killScore) * 100).toFixed(1) : '0'
  }))).sort((a, b) => b.kills - a.kills) : [];

  // Função para formatar os times de uma partida específica
  const getSortedTeams = (teams: Team[]) => [...teams].sort((a, b) => b.totalScore - a.totalScore || a.rank - b.rank);

  return (
    <div className="min-h-screen pb-24 selection:bg-yellow-400 selection:text-zinc-900 bg-[#09090b]">
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-yellow-500" size={48} />
            <p className="text-yellow-500 font-black tracking-widest uppercase text-xs">Sincronizando Nuvem...</p>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.4)] rotate-3">
              <Shield className="text-zinc-950" size={28} fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
                  Treinos <span className="text-yellow-400">Team Solid</span>
                </h1>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-wider ${roomID ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${roomID ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                  {roomID ? `SALA: ${roomID.slice(-6)}` : 'MODO LOCAL'}
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-zinc-500 mt-1">Painel de Análise</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!roomID ? (
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-yellow-500 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-xl border-b-4 border-zinc-950"
              >
                <Globe size={16} /> SINCRONIZAR NUVEM
              </button>
            ) : (
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-500/10 border border-green-500/50 text-green-500 font-black text-[10px] uppercase tracking-widest hover:bg-green-500/20 transition-all active:scale-95 shadow-xl"
              >
                {copySuccess ? <Copy size={16} /> : <Share2 size={16} />}
                {copySuccess ? 'LINK COPIADO!' : 'COMPARTILHAR SALA'}
              </button>
            )}

            <button 
              onClick={resetMatches}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-xl"
            >
              <RotateCcw size={16} className="text-zinc-500" /> NOVO
            </button>

            <label className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-2xl ${isUploading ? 'bg-zinc-800 text-zinc-500' : 'bg-yellow-500 hover:bg-yellow-400 text-zinc-950 border-b-4 border-yellow-700'}`}>
              {isUploading ? <Zap className="animate-spin" size={16} /> : <Upload size={16} />}
              {isUploading ? 'LENDO...' : 'IMPORTAR'}
              <input type="file" accept=".log,.txt" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
            
            <button onClick={clearData} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-900 text-zinc-700 hover:text-red-500 transition-all"><Trash2 size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-10">
        <nav className="flex bg-zinc-900/50 p-1.5 rounded-3xl w-fit mx-auto mb-12 border border-zinc-800 backdrop-blur-sm overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: 'global-teams', label: 'Ranking Geral', icon: <Trophy size={14} /> },
            { id: 'global-players', label: 'Top Fraggers', icon: <Users size={14} /> },
            { id: 'match-teams', label: 'Última Rodada', icon: <TrendingUp size={14} /> },
            { id: 'match-players', label: 'MVPs Rodada', icon: <UserCheck size={14} /> },
            { id: 'match-history', label: 'Histórico', icon: <ListOrdered size={14} /> },
            { id: 'maps', label: 'Mapas', icon: <MapIcon size={14} /> }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as TabType)} 
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-[10px] tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-zinc-800 text-white shadow-2xl ring-1 ring-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {tab.icon}
              {tab.label.toUpperCase()}
            </button>
          ))}
        </nav>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className={activeTab === 'global-teams' ? 'block' : 'hidden'}>
            <TableCard title="Ranking Geral" subtitle="Estatísticas Acumuladas" icon={<Trophy size={20} />} data={getGlobalTeamStats()}
              columns={[
                { header: 'POS', accessor: (_, idx) => <span className="text-zinc-600 font-black">#{idx + 1}</span>, align: 'center', width: '45px' },
                { header: 'TIME', accessor: (t) => <span className="uppercase font-bold text-zinc-100 text-[12px]">{t.teamName}</span> },
                { header: 'PJ', accessor: (t) => t.matchesPlayed, align: 'center', width: '40px' },
                { header: 'B', accessor: (t) => t.totalBooyahs, align: 'center', width: '40px' },
                { header: 'K', accessor: (t) => t.totalKills, align: 'center', width: '40px' },
                { header: '% ABTS', accessor: (t) => (t.totalPoints > 0 ? ((t.totalKills / t.totalPoints) * 100).toFixed(0) : 0) + '%', align: 'center', width: '55px' },
                { header: 'PTS POS', accessor: (t) => t.totalRankPoints, align: 'center', width: '60px' },
                { header: '% POS', accessor: (t) => (t.totalPoints > 0 ? ((t.totalRankPoints / t.totalPoints) * 100).toFixed(0) : 0) + '%', align: 'center', width: '55px' },
                { header: 'PONTOS', accessor: (t) => <span className="font-black text-yellow-400 text-lg tracking-tighter">{t.totalPoints}</span>, align: 'center', width: '75px' },
              ]}
            />
          </div>

          <div className={activeTab === 'global-players' ? 'block' : 'hidden'}>
            <TableCard title="Top Fraggers" subtitle="Líderes de Abates" icon={<Users size={20} />} data={getGlobalPlayerStats()}
              columns={[
                { header: 'POS', accessor: (_, idx) => <span className="text-zinc-600 font-black">#{idx + 1}</span>, align: 'center', width: '45px' },
                { header: 'JOGADOR', accessor: (p) => <span className="font-bold text-zinc-100">{p.playerName}</span> },
                { header: 'TIME', accessor: (p) => <span className="text-[9px] font-black uppercase text-zinc-600 truncate">{p.teamName}</span> },
                { header: 'PJ', accessor: (p) => p.matchesPlayed, align: 'center', width: '40px' },
                { header: 'MÉDIA', accessor: (p) => p.averageKills, align: 'center', width: '60px' },
                { header: 'K', accessor: (p) => <span className="font-black text-yellow-400 text-lg">{p.totalKills}</span>, align: 'center', width: '80px' },
              ]}
            />
          </div>

          <div className={activeTab === 'match-teams' ? 'block' : 'hidden'}>
            <div className="space-y-4">
              {lastMatch ? (
                <>
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-yellow-500" size={18} />
                      <p className="font-black text-white text-[11px] uppercase tracking-widest">{new Date(lastMatch.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <TableCard title="Última Rodada" icon={<Shield size={20} />} data={matchTeams}
                    columns={[
                      { header: 'RANK', accessor: (t) => <span className={`font-black ${t.rank === 1 ? 'text-yellow-400' : 'text-zinc-600'}`}>#{t.rank}</span>, align: 'center', width: '45px' },
                      { header: 'EQUIPE', accessor: (t) => <span className={`font-bold uppercase text-[12px] ${t.rank === 1 ? 'text-yellow-400' : 'text-zinc-100'}`}>{t.teamName}</span> },
                      { header: 'K', accessor: (t) => t.killScore, align: 'center', width: '40px' },
                      { header: '% ABTS', accessor: (t) => (t.totalScore > 0 ? ((t.killScore / t.totalScore) * 100).toFixed(0) : 0) + '%', align: 'center', width: '55px' },
                      { header: 'PTS POS', accessor: (t) => t.rankScore, align: 'center', width: '60px' },
                      { header: '% POS', accessor: (t) => (t.totalScore > 0 ? ((t.rankScore / t.totalScore) * 100).toFixed(0) : 0) + '%', align: 'center', width: '55px' },
                      { header: 'PONTOS', accessor: (t) => <span className="font-black text-lg">{t.totalScore}</span>, align: 'center', width: '75px' },
                    ]}
                  />
                </>
              ) : <EmptyState icon={<HistoryIcon size={20} />} text="Nenhum dado importado" />}
            </div>
          </div>

          <div className={activeTab === 'match-history' ? 'block' : 'hidden'}>
            <div className="space-y-12">
              {matches.length > 0 ? (
                [...matches].reverse().map((match, idx) => (
                  <div key={match.id} className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-yellow-500 font-black text-xs">
                        {matches.length - idx}
                      </div>
                      <p className="font-black text-zinc-400 text-[10px] uppercase tracking-[0.2em]">
                        Partida em {new Date(match.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <TableCard 
                      title={`Resultado Queda ${matches.length - idx}`} 
                      icon={<ListOrdered size={20} />} 
                      data={getSortedTeams(match.teams)}
                      columns={[
                        { header: 'RANK', accessor: (t) => <span className={`font-black ${t.rank === 1 ? 'text-yellow-400' : 'text-zinc-600'}`}>#{t.rank}</span>, align: 'center', width: '45px' },
                        { header: 'EQUIPE', accessor: (t) => <span className={`font-bold uppercase text-[12px] ${t.rank === 1 ? 'text-yellow-400' : 'text-zinc-100'}`}>{t.teamName}</span> },
                        { header: 'K', accessor: (t) => t.killScore, align: 'center', width: '40px' },
                        { header: '% ABTS', accessor: (t) => (t.totalScore > 0 ? ((t.killScore / t.totalScore) * 100).toFixed(0) : 0) + '%', align: 'center', width: '55px' },
                        { header: 'PTS POS', accessor: (t) => t.rankScore, align: 'center', width: '60px' },
                        { header: '% POS', accessor: (t) => (t.totalScore > 0 ? ((t.rankScore / t.totalScore) * 100).toFixed(0) : 0) + '%', align: 'center', width: '55px' },
                        { header: 'PONTOS', accessor: (t) => <span className="font-black text-lg">{t.totalScore}</span>, align: 'center', width: '75px' },
                      ]}
                    />
                  </div>
                ))
              ) : <EmptyState icon={<HistoryIcon size={20} />} text="Histórico vazio" />}
            </div>
          </div>

          <div className={activeTab === 'match-players' ? 'block' : 'hidden'}>
            {lastMatch ? <TableCard title="MVPs da Rodada" icon={<Sword size={20} />} data={matchMVPs}
              columns={[
                { header: 'POS', accessor: (_, idx) => <span className="text-zinc-600 font-black">#{idx + 1}</span>, align: 'center', width: '45px' },
                { header: 'JOGADOR', accessor: (p) => <span className="font-bold text-zinc-100">{p.name}</span> },
                { header: 'TIME', accessor: (p) => <span className="text-[9px] font-black text-zinc-600">{p.teamName}</span> },
                { header: '% TIME', accessor: (p) => p.participation + '%', align: 'center', width: '60px' },
                { header: 'K', accessor: (p) => <span className="font-black text-yellow-400 text-lg">{p.kills}</span>, align: 'center', width: '80px' },
              ]}
            /> : <EmptyState icon={<Users size={20} />} text="Sem destaques disponíveis" />}
          </div>
          
          <div className={activeTab === 'maps' ? 'block' : 'hidden'}>
            <MapPicker />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/50 py-3 z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p className="text-[9px] text-zinc-600 uppercase tracking-[0.4em] font-black">TEAM SOLID <span className="text-yellow-500 underline">CLOUD SYNC v4</span></p>
          {roomID && <span className="text-[8px] text-green-500/50 font-black uppercase animate-pulse">Sincronizado com ID: {roomID}</span>}
        </div>
      </footer>
    </div>
  );
};

const EmptyState = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/10 rounded-[2.5rem] border-2 border-dashed border-zinc-800/30">
    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mb-4 text-zinc-700">{icon}</div>
    <h3 className="text-sm font-black text-zinc-600 uppercase tracking-widest">{text}</h3>
  </div>
);

export default App;
