
import { useState, useEffect } from 'react';
import { Match, GlobalTeamStats, GlobalPlayerStats, Team, MapInfo } from './types';

const STORAGE_KEY = 'team_solid_data_v1';
const MAPS_STORAGE_KEY = 'team_solid_maps_v1';

export const MAPS_DATABASE: MapInfo[] = [
  { id: 'BER', name: 'Bermuda', url: 'https://i.ibb.co/mrHhztmS/BERMUDA.png' },
  { id: 'ALP', name: 'Alpine', url: 'https://i.ibb.co/XZFNYHBG/ALPINE.png' },
  { id: 'PUR', name: 'Purgatório', url: 'https://i.ibb.co/gZ0Psrnh/PURGAT-RIO.png' },
  { id: 'NT', name: 'Nova Terra', url: 'https://i.ibb.co/ZR4tgkMx/NOVA-TERRA.png' },
  { id: 'KAL', name: 'Kalahari', url: 'https://i.ibb.co/XZNQ78r6/KALAHARI.png' },
  { id: 'SOL', name: 'Solara', url: 'https://i.ibb.co/j9bT8t3R/SOLARA.png' },
];

export const useMatchStore = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [mapSequence, setMapSequence] = useState<MapInfo[]>([]);
  const [availableMaps, setAvailableMaps] = useState<MapInfo[]>([...MAPS_DATABASE]);

  useEffect(() => {
    const savedMatches = localStorage.getItem(STORAGE_KEY);
    if (savedMatches) {
      try {
        const parsed = JSON.parse(savedMatches);
        if (Array.isArray(parsed)) setMatches(parsed);
      } catch (e) {
        console.error("Failed to load matches", e);
      }
    }

    const savedMaps = localStorage.getItem(MAPS_STORAGE_KEY);
    if (savedMaps) {
      try {
        const { sequence, available } = JSON.parse(savedMaps);
        setMapSequence(sequence || []);
        setAvailableMaps(available || [...MAPS_DATABASE]);
      } catch (e) {
        console.error("Failed to load maps", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify({
      sequence: mapSequence,
      available: availableMaps
    }));
  }, [mapSequence, availableMaps]);

  const addMatch = (teams: Team[]) => {
    const newMatch: Match = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      teams: teams
    };
    setMatches(prev => [...prev, newMatch]);
  };

  const resetMatches = () => {
    if (confirm("Deseja iniciar um NOVO TREINO? Isso apagará todas as partidas e tabelas atuais.")) {
      setMatches([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearData = () => {
    if (confirm("ALERTA: Isso apagará TUDO (Histórico + Mapas). Tem certeza?")) {
      setMatches([]);
      setMapSequence([]);
      setAvailableMaps([...MAPS_DATABASE]);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MAPS_STORAGE_KEY);
    }
  };

  const updateMaps = (newSequence: MapInfo[], newAvailable: MapInfo[]) => {
    setMapSequence(newSequence);
    setAvailableMaps(newAvailable);
  };

  const resetMaps = () => {
    setMapSequence([]);
    setAvailableMaps([...MAPS_DATABASE]);
  };

  const getGlobalTeamStats = (): GlobalTeamStats[] => {
    const statsMap = new Map<string, { kills: number, rankPoints: number, points: number, matches: number, booyahs: number }>();

    matches.forEach(match => {
      match.teams.forEach(team => {
        const name = team.teamName;
        const existing = statsMap.get(name) || { kills: 0, rankPoints: 0, points: 0, matches: 0, booyahs: 0 };
        
        const k = Number(team.killScore) || 0;
        const rp = Number(team.rankScore) || 0;
        const p = Number(team.totalScore) || 0;
        const isBooyah = Number(team.rank) === 1 ? 1 : 0;

        statsMap.set(name, {
          kills: existing.kills + k,
          rankPoints: existing.rankPoints + rp,
          points: existing.points + p,
          matches: existing.matches + 1,
          booyahs: existing.booyahs + isBooyah
        });
      });
    });

    return Array.from(statsMap.entries()).map(([name, data]) => ({
      teamName: name,
      matchesPlayed: data.matches,
      totalKills: data.kills,
      totalRankPoints: data.rankPoints,
      totalPoints: data.points,
      averagePoints: Number((data.points / data.matches).toFixed(2)),
      totalBooyahs: data.booyahs
    })).sort((a, b) => b.totalPoints - a.totalPoints || b.totalBooyahs - a.totalBooyahs || b.totalKills - a.totalKills);
  };

  const getGlobalPlayerStats = (): GlobalPlayerStats[] => {
    const statsMap = new Map<string, { team: string, kills: number, matches: number }>();

    matches.forEach(match => {
      match.teams.forEach(team => {
        team.players.forEach(player => {
          const key = `${player.name}|||${team.teamName}`;
          const existing = statsMap.get(key) || { team: team.teamName, kills: 0, matches: 0 };
          const k = Number(player.kills) || 0;

          statsMap.set(key, {
            team: team.teamName,
            kills: existing.kills + k,
            matches: existing.matches + 1
          });
        });
      });
    });

    return Array.from(statsMap.entries()).map(([key, data]) => ({
      playerName: key.split('|||')[0],
      teamName: data.team,
      matchesPlayed: data.matches,
      totalKills: data.kills,
      averageKills: Number((data.kills / data.matches).toFixed(2))
    })).sort((a, b) => b.totalKills - a.totalKills || b.averageKills - a.averageKills);
  };

  return {
    matches,
    mapSequence,
    availableMaps,
    addMatch,
    resetMatches,
    clearData,
    updateMaps,
    resetMaps,
    getGlobalTeamStats,
    getGlobalPlayerStats
  };
};
