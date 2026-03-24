
import React, { useState } from 'react';
import { 
  Trophy, Upload, History as HistoryIcon, Users, TrendingUp, Calendar, Sword, Shield, Trash2, Zap, Map as MapIcon, Crown, RotateCcw, UserCheck, Share2, Globe, Cloud, Loader2, Copy, ListOrdered, Crosshair, Edit2, X, Save
} from 'lucide-react';
import { useMatchStore } from './store';
import { parseLogFile } from './parser';
import { TableCard } from './components/TableCard';
import { MapPicker } from './components/MapPicker';
import { Top3Banner } from './components/Top3Banner';
import { Top5FraggersBanner } from './components/Top5FraggersBanner';
import { Player, Team } from './types';

interface MatchMVP extends Player {
  teamName: string;
  teamRank: number;
  participation: string;
}

type TabType = 'global-teams' | 'top3' | 'global-players' | 'top5-fraggers' | 'match-teams' | 'match-players' | 'match-history' | 'maps';

const App: React.FC = () => {
  const { matches, addMatch, resetMatches, clearData, getGlobalTeamStats, getGlobalPlayerStats, createRoom, roomID, isLoading, updateTeamMatchStats } = useMatchStore();
  const [activeTab, setActiveTab] = useState<TabType>('global-teams');
  const [isUploading, setIsUploading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [editingTeam, setEditingTeam] = useState<{ matchId: string, teamName: string, kills: number, rankPoints: number } | null>(null);

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
    <div className="min-h-screen pb-24 selection:bg-accent selection:text-primary bg-primary font-sans">
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-accent" size={48} />
            <p className="text-accent font-heading font-bold tracking-widest uppercase text-xs">Sincronizando Nuvem...</p>
          </div>
        </div>
      )}

      {editingTeam && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-secondary p-6 rounded-3xl border border-tertiary w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-textMain uppercase tracking-widest">Editar Pontuação</h3>
              <button onClick={() => setEditingTeam(null)} className="text-textMuted hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-tertiary uppercase tracking-widest mb-2">Equipe</label>
                <div className="px-4 py-3 bg-primary rounded-xl text-textMain font-bold border border-tertiary/50">
                  {editingTeam.teamName}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-tertiary uppercase tracking-widest mb-2">Kills (Abates)</label>
                <input 
                  type="number" 
                  value={editingTeam.kills}
                  onChange={(e) => setEditingTeam({...editingTeam, kills: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-primary rounded-xl text-textMain font-bold border border-tertiary focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-tertiary uppercase tracking-widest mb-2">Pontos de Posição</label>
                <input 
                  type="number" 
                  value={editingTeam.rankPoints}
                  onChange={(e) => setEditingTeam({...editingTeam, rankPoints: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 bg-primary rounded-xl text-textMain font-bold border border-tertiary focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <button 
                onClick={() => {
                  updateTeamMatchStats(editingTeam.matchId, editingTeam.teamName, editingTeam.kills, editingTeam.rankPoints);
                  setEditingTeam(null);
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 mt-6 rounded-xl bg-accent text-primary font-bold text-[12px] uppercase tracking-widest hover:bg-accent/80 transition-all active:scale-95"
              >
                <Save size={18} /> SALVAR ALTERAÇÕES
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-secondary/90 backdrop-blur-xl border-b border-tertiary/30 px-6 py-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              <img 
                src="https://i.ibb.co/5X713T8z/TS-LOGO-OFICIAL.png" 
                alt="Team Solid Logo" 
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(212,162,76,0.4)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tighter uppercase text-textMain leading-none">
                  Treinos <span className="text-accent">Team Solid</span>
                </h1>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-bold uppercase tracking-wider ${roomID ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-tertiary/50 border-tertiary text-textMuted'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${roomID ? 'bg-green-500 animate-pulse' : 'bg-textMuted'}`}></div>
                  {roomID ? `SALA: ${roomID.slice(-6)}` : 'MODO LOCAL'}
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-textMuted mt-1">Painel de Análise</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!roomID ? (
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary border border-tertiary text-accent font-bold text-[10px] uppercase tracking-widest hover:bg-tertiary transition-all active:scale-95 shadow-xl border-b-4 border-primary"
              >
                <Globe size={16} /> SINCRONIZAR NUVEM
              </button>
            ) : (
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-500/10 border border-green-500/50 text-green-500 font-bold text-[10px] uppercase tracking-widest hover:bg-green-500/20 transition-all active:scale-95 shadow-xl"
              >
                {copySuccess ? <Copy size={16} /> : <Share2 size={16} />}
                {copySuccess ? 'LINK COPIADO!' : 'COMPARTILHAR SALA'}
              </button>
            )}

            <button 
              onClick={resetMatches}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-secondary border border-tertiary text-textMain font-bold text-[10px] uppercase tracking-widest hover:bg-tertiary transition-all active:scale-95 shadow-xl"
            >
              <RotateCcw size={16} className="text-textMuted" /> NOVO
            </button>

            <label className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-2xl ${isUploading ? 'bg-tertiary text-textMuted' : 'bg-accent hover:bg-accent/80 text-primary border-b-4 border-accent/50'}`}>
              {isUploading ? <Zap className="animate-spin" size={16} /> : <Upload size={16} />}
              {isUploading ? 'LENDO...' : 'IMPORTAR'}
              <input type="file" accept=".log,.txt" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
            
            <button onClick={clearData} className="p-3 rounded-2xl bg-primary border border-secondary text-tertiary hover:text-red-500 transition-all"><Trash2 size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-10">
        <nav className="flex bg-secondary/50 p-1.5 rounded-3xl w-fit mx-auto mb-12 border border-tertiary/50 backdrop-blur-sm overflow-x-auto max-w-full no-scrollbar">
          {[
            { id: 'global-teams', label: 'Ranking Geral', icon: <Trophy size={14} /> },
            { id: 'top3', label: 'Top 3', icon: <Crown size={14} /> },
            { id: 'global-players', label: 'Top Fraggers', icon: <Users size={14} /> },
            { id: 'top5-fraggers', label: 'Top 5 Fraggers', icon: <Crosshair size={14} /> },
            { id: 'match-teams', label: 'Última Rodada', icon: <TrendingUp size={14} /> },
            { id: 'match-players', label: 'MVPs Rodada', icon: <UserCheck size={14} /> },
            { id: 'match-history', label: 'Histórico', icon: <ListOrdered size={14} /> },
            { id: 'maps', label: 'Mapas', icon: <MapIcon size={14} /> }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as TabType)} 
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-[10px] tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-tertiary text-textMain shadow-2xl ring-1 ring-tertiary/50' : 'text-textMuted hover:text-textMain'}`}
            >
              {tab.icon}
              {tab.label.toUpperCase()}
            </button>
          ))}
        </nav>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className={activeTab === 'global-teams' ? 'block' : 'hidden'}>
            {(() => {
              const data = getGlobalTeamStats();
              return (
                <TableCard title="Ranking Geral" subtitle="Estatísticas Acumuladas" icon={<Trophy size={20} />} data={data}
                  columns={[
                    { 
                      header: 'POS', 
                      accessor: (_, idx) => {
                        let colorClass = "text-textMuted";
                        if (idx < 3) colorClass = "text-accent";
                        if (idx >= data.length - 2 && data.length > 3) colorClass = "text-red-500";
                        return <span className={`${colorClass} font-bold`}>#{idx + 1}</span>;
                      }, 
                      align: 'center', 
                      width: '45px' 
                    },
                    { 
                      header: 'TIME', 
                      accessor: (t, idx) => {
                        let colorClass = "text-textMain";
                        if (idx < 3) colorClass = "text-accent";
                        if (idx >= data.length - 2 && data.length > 3) colorClass = "text-red-500";
                        return (
                          <div className="flex items-center gap-2">
                            <span className={`uppercase font-bold text-[12px] ${colorClass}`}>{t.teamName}</span>
                            {t.totalPoints >= 80 && (
                              <div className="flex items-center gap-1 group relative">
                                <Crown size={12} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                                <span className="text-[8px] bg-accent/20 text-accent px-1 rounded border border-accent/30 font-black">BOOYAH OURO</span>
                              </div>
                            )}
                          </div>
                        );
                      } 
                    },
                    { header: 'PJ', accessor: (t) => <span className="text-textMuted">{t.matchesPlayed}</span>, align: 'center', width: '40px' },
                    { header: 'B', accessor: (t) => <span className="text-textMuted">{t.totalBooyahs}</span>, align: 'center', width: '40px' },
                    { header: 'K', accessor: (t) => <span className="text-textMuted">{t.totalKills}</span>, align: 'center', width: '40px' },
                    { header: '% ABTS', accessor: (t) => <span className="text-textMuted">{(t.totalPoints > 0 ? ((t.totalKills / t.totalPoints) * 100).toFixed(0) : 0) + '%'}</span>, align: 'center', width: '55px' },
                    { header: 'PTS POS', accessor: (t) => <span className="text-textMuted">{t.totalRankPoints}</span>, align: 'center', width: '60px' },
                    { header: '% POS', accessor: (t) => <span className="text-textMuted">{(t.totalPoints > 0 ? ((t.totalRankPoints / t.totalPoints) * 100).toFixed(0) : 0) + '%'}</span>, align: 'center', width: '55px' },
                    { header: 'PONTOS', accessor: (t, idx) => {
                      let colorClass = "text-accent";
                      if (idx >= data.length - 2 && data.length > 3) colorClass = "text-red-500";
                      return <span className={`font-bold ${colorClass} text-lg tracking-tighter`}>{t.totalPoints}</span>;
                    }, align: 'center', width: '75px' },
                  ]}
                />
              );
            })()}
          </div>

          <div className={activeTab === 'top3' ? 'block' : 'hidden'}>
            <Top3Banner data={getGlobalTeamStats()} />
          </div>

          <div className={activeTab === 'global-players' ? 'block' : 'hidden'}>
            <TableCard title="Top Fraggers" subtitle="Líderes de Abates" icon={<Users size={20} />} data={getGlobalPlayerStats()}
              columns={[
                { header: 'POS', accessor: (_, idx) => <span className="text-tertiary font-bold">#{idx + 1}</span>, align: 'center', width: '45px' },
                { header: 'JOGADOR', accessor: (p) => <span className="font-bold text-textMain">{p.playerName}</span> },
                { header: 'TIME', accessor: (p) => <span className="text-[9px] font-bold uppercase text-tertiary truncate">{p.teamName}</span> },
                { header: 'PJ', accessor: (p) => p.matchesPlayed, align: 'center', width: '40px' },
                { header: 'MÉDIA', accessor: (p) => p.averageKills, align: 'center', width: '60px' },
                { header: 'K', accessor: (p) => <span className="font-bold text-accent text-lg">{p.totalKills}</span>, align: 'center', width: '80px' },
              ]}
            />
          </div>

          <div className={activeTab === 'top5-fraggers' ? 'block' : 'hidden'}>
            <Top5FraggersBanner data={getGlobalPlayerStats()} />
          </div>

          <div className={activeTab === 'match-teams' ? 'block' : 'hidden'}>
            <div className="space-y-4">
              {lastMatch ? (
                <>
                  <div className="bg-secondary/50 p-4 rounded-2xl border border-tertiary flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-accent" size={18} />
                      <p className="font-bold text-textMain text-[11px] uppercase tracking-widest">{new Date(lastMatch.timestamp).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  <TableCard title="Última Rodada" icon={<Shield size={20} />} data={matchTeams}
                    columns={[
                      { 
                        header: 'RANK', 
                        accessor: (t, idx) => {
                          let colorClass = "text-tertiary";
                          if (idx < 3) colorClass = "text-accent";
                          if (idx >= matchTeams.length - 2 && matchTeams.length > 3) colorClass = "text-red-500";
                          return <span className={`${colorClass} font-bold`}>#{t.rank}</span>;
                        }, 
                        align: 'center', 
                        width: '45px' 
                      },
                      { 
                        header: 'EQUIPE', 
                        accessor: (t, idx) => {
                          let colorClass = "text-textMain";
                          if (idx < 3) colorClass = "text-accent";
                          if (idx >= matchTeams.length - 2 && matchTeams.length > 3) colorClass = "text-red-500";
                          return <span className={`font-bold uppercase text-[12px] ${colorClass}`}>{t.teamName}</span>;
                        } 
                      },
                      { header: 'K', accessor: (t) => <span className="text-textMuted">{t.killScore}</span>, align: 'center', width: '40px' },
                      { header: '% ABTS', accessor: (t) => <span className="text-textMuted">{(t.totalScore > 0 ? ((t.killScore / t.totalScore) * 100).toFixed(0) : 0) + '%'}</span>, align: 'center', width: '55px' },
                      { header: 'PTS POS', accessor: (t) => <span className="text-textMuted">{t.rankScore}</span>, align: 'center', width: '60px' },
                      { header: '% POS', accessor: (t) => <span className="text-textMuted">{(t.totalScore > 0 ? ((t.rankScore / t.totalScore) * 100).toFixed(0) : 0) + '%'}</span>, align: 'center', width: '55px' },
                      { header: 'PONTOS', accessor: (t, idx) => {
                        let colorClass = "text-textMain";
                        if (idx < 3) colorClass = "text-accent";
                        if (idx >= matchTeams.length - 2 && matchTeams.length > 3) colorClass = "text-red-500";
                        return <span className={`font-bold text-lg ${colorClass}`}>{t.totalScore}</span>;
                      }, align: 'center', width: '75px' },
                      { 
                        header: '', 
                        accessor: (t) => (
                          <button 
                            onClick={() => setEditingTeam({ matchId: lastMatch.id, teamName: t.teamName, kills: t.killScore, rankPoints: t.rankScore })}
                            className="p-1.5 text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                            title="Editar Pontuação"
                          >
                            <Edit2 size={14} />
                          </button>
                        ), 
                        align: 'center', 
                        width: '40px' 
                      },
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
                      <div className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center border border-tertiary text-accent font-bold text-xs">
                        {matches.length - idx}
                      </div>
                      <p className="font-bold text-textMuted text-[10px] uppercase tracking-[0.2em]">
                        Partida em {new Date(match.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <TableCard 
                      title={`Resultado Queda ${matches.length - idx}`} 
                      icon={<ListOrdered size={20} />} 
                      data={getSortedTeams(match.teams)}
                      columns={[
                        { 
                          header: 'RANK', 
                          accessor: (t, teamIdx) => {
                            const sortedTeams = getSortedTeams(match.teams);
                            let colorClass = "text-tertiary";
                            if (teamIdx < 3) colorClass = "text-accent";
                            if (teamIdx >= sortedTeams.length - 2 && sortedTeams.length > 3) colorClass = "text-red-500";
                            return <span className={`${colorClass} font-bold`}>#{t.rank}</span>;
                          }, 
                          align: 'center', 
                          width: '45px' 
                        },
                        { 
                          header: 'EQUIPE', 
                          accessor: (t, teamIdx) => {
                            const sortedTeams = getSortedTeams(match.teams);
                            let colorClass = "text-textMain";
                            if (teamIdx < 3) colorClass = "text-accent";
                            if (teamIdx >= sortedTeams.length - 2 && sortedTeams.length > 3) colorClass = "text-red-500";
                            return <span className={`font-bold uppercase text-[12px] ${colorClass}`}>{t.teamName}</span>;
                          } 
                        },
                        { header: 'K', accessor: (t) => <span className="text-textMuted">{t.killScore}</span>, align: 'center', width: '40px' },
                        { header: '% ABTS', accessor: (t) => <span className="text-textMuted">{(t.totalScore > 0 ? ((t.killScore / t.totalScore) * 100).toFixed(0) : 0) + '%'}</span>, align: 'center', width: '55px' },
                        { header: 'PTS POS', accessor: (t) => <span className="text-textMuted">{t.rankScore}</span>, align: 'center', width: '60px' },
                        { header: '% POS', accessor: (t) => <span className="text-textMuted">{(t.totalScore > 0 ? ((t.rankScore / t.totalScore) * 100).toFixed(0) : 0) + '%'}</span>, align: 'center', width: '55px' },
                        { header: 'PONTOS', accessor: (t, teamIdx) => {
                          const sortedTeams = getSortedTeams(match.teams);
                          let colorClass = "text-textMain";
                          if (teamIdx < 3) colorClass = "text-accent";
                          if (teamIdx >= sortedTeams.length - 2 && sortedTeams.length > 3) colorClass = "text-red-500";
                          return <span className={`font-bold text-lg ${colorClass}`}>{t.totalScore}</span>;
                        }, align: 'center', width: '75px' },
                        { 
                          header: '', 
                          accessor: (t) => (
                            <button 
                              onClick={() => setEditingTeam({ matchId: match.id, teamName: t.teamName, kills: t.killScore, rankPoints: t.rankScore })}
                              className="p-1.5 text-tertiary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                              title="Editar Pontuação"
                            >
                              <Edit2 size={14} />
                            </button>
                          ), 
                          align: 'center', 
                          width: '40px' 
                        },
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
                { header: 'POS', accessor: (_, idx) => <span className="text-tertiary font-bold">#{idx + 1}</span>, align: 'center', width: '45px' },
                { header: 'JOGADOR', accessor: (p) => <span className="font-bold text-textMain">{p.name}</span> },
                { header: 'TIME', accessor: (p) => <span className="text-[9px] font-bold text-tertiary">{p.teamName}</span> },
                { header: '% TIME', accessor: (p) => p.participation + '%', align: 'center', width: '60px' },
                { header: 'K', accessor: (p) => <span className="font-bold text-accent text-lg">{p.kills}</span>, align: 'center', width: '80px' },
              ]}
            /> : <EmptyState icon={<Users size={20} />} text="Sem destaques disponíveis" />}
          </div>
          
          <div className={activeTab === 'maps' ? 'block' : 'hidden'}>
            <MapPicker />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-secondary/90 backdrop-blur-xl border-t border-tertiary/30 py-3 z-50">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p className="text-[9px] text-tertiary uppercase tracking-[0.4em] font-bold">TEAM SOLID <span className="text-accent underline">CLOUD SYNC v4</span></p>
          {roomID && <span className="text-[8px] text-green-500/50 font-bold uppercase animate-pulse">Sincronizado com ID: {roomID}</span>}
        </div>
      </footer>
    </div>
  );
};

const EmptyState = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex flex-col items-center justify-center py-24 bg-secondary/10 rounded-[2.5rem] border-2 border-dashed border-tertiary/30">
    <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center border border-tertiary mb-4 text-tertiary">{icon}</div>
    <h3 className="text-sm font-bold text-tertiary uppercase tracking-widest">{text}</h3>
  </div>
);

export default App;
