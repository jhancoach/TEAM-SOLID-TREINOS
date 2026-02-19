
import { useState, useEffect } from 'react';
import { Match, GlobalTeamStats, GlobalPlayerStats, Team, MapInfo } from './types';

const STORAGE_KEY = 'team_solid_data_v1';
const MAPS_STORAGE_KEY = 'team_solid_maps_v1';
const API_BASE = 'https://jsonblob.com/api/jsonBlob';

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
  const [roomID, setRoomID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Inicialização: Verifica se há sala na URL ou no LocalStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const salaFromUrl = urlParams.get('sala');

    if (salaFromUrl) {
      loadFromCloud(salaFromUrl);
    } else {
      const savedMatches = localStorage.getItem(STORAGE_KEY);
      if (savedMatches) {
        try {
          const parsed = JSON.parse(savedMatches);
          if (Array.isArray(parsed)) setMatches(parsed);
        } catch (e) { console.error(e); }
      }
    }

    const savedMaps = localStorage.getItem(MAPS_STORAGE_KEY);
    if (savedMaps) {
      try {
        const { sequence, available } = JSON.parse(savedMaps);
        setMapSequence(sequence || []);
        setAvailableMaps(available || [...MAPS_DATABASE]);
      } catch (e) { console.error(e); }
    }
  }, []);

  // Salva no LocalStorage sempre que houver mudança local
  useEffect(() => {
    if (!roomID) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
    }
  }, [matches, roomID]);

  const loadFromCloud = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
        setMapSequence(data.maps?.sequence || []);
        setAvailableMaps(data.maps?.available || [...MAPS_DATABASE]);
        setRoomID(id);
      } else {
        alert("Sala não encontrada ou expirada. Carregando dados locais.");
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (e) {
      console.error("Erro ao carregar da nuvem:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async () => {
    setIsLoading(true);
    try {
      const payload = {
        matches,
        maps: { sequence: mapSequence, available: availableMaps }
      };
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const location = res.headers.get('Location');
      if (location) {
        const id = location.split('/').pop();
        if (id) {
          setRoomID(id);
          const newUrl = `${window.location.origin}${window.location.pathname}?sala=${id}`;
          window.history.replaceState({}, '', newUrl);
          return newUrl;
        }
      }
    } catch (e) {
      console.error("Erro ao criar sala:", e);
      alert("Erro ao sincronizar com a nuvem.");
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const updateCloud = async (newMatches: Match[]) => {
    if (!roomID) return;
    try {
      const payload = {
        matches: newMatches,
        maps: { sequence: mapSequence, available: availableMaps }
      };
      await fetch(`${API_BASE}/${roomID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Erro ao atualizar nuvem:", e);
    }
  };

  const addMatch = (teams: Team[]) => {
    const newMatch: Match = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      teams: teams
    };
    const updated = [...matches, newMatch];
    setMatches(updated);
    if (roomID) updateCloud(updated);
  };

  const resetMatches = () => {
    if (confirm("Deseja iniciar um NOVO TREINO? Isso apagará todas as partidas atuais.")) {
      setMatches([]);
      if (roomID) updateCloud([]);
      else localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearData = () => {
    if (confirm("ALERTA: Isso apagará TUDO. Tem certeza?")) {
      setMatches([]);
      setMapSequence([]);
      setAvailableMaps([...MAPS_DATABASE]);
      setRoomID(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(MAPS_STORAGE_KEY);
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const updateMaps = (newSequence: MapInfo[], newAvailable: MapInfo[]) => {
    setMapSequence(newSequence);
    setAvailableMaps(newAvailable);
    if (roomID) {
      const payload = { matches, maps: { sequence: newSequence, available: newAvailable } };
      fetch(`${API_BASE}/${roomID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
  };

  const resetMaps = () => {
    const defaultAvailable = [...MAPS_DATABASE];
    setMapSequence([]);
    setAvailableMaps(defaultAvailable);
    if (roomID) {
      const payload = { matches, maps: { sequence: [], available: defaultAvailable } };
      fetch(`${API_BASE}/${roomID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
  };

  const getGlobalTeamStats = (): GlobalTeamStats[] => {
    const statsMap = new Map<string, { kills: number, rankPoints: number, points: number, matches: number, booyahs: number }>();
    matches.forEach(match => {
      match.teams.forEach(team => {
        const name = team.teamName;
        const existing = statsMap.get(name) || { kills: 0, rankPoints: 0, points: 0, matches: 0, booyahs: 0 };
        statsMap.set(name, {
          kills: existing.kills + (Number(team.killScore) || 0),
          rankPoints: existing.rankPoints + (Number(team.rankScore) || 0),
          points: existing.points + (Number(team.totalScore) || 0),
          matches: existing.matches + 1,
          booyahs: existing.booyahs + (Number(team.rank) === 1 ? 1 : 0)
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
    })).sort((a, b) => b.totalPoints - a.totalPoints || b.totalBooyahs - a.totalBooyahs);
  };

  const getGlobalPlayerStats = (): GlobalPlayerStats[] => {
    const statsMap = new Map<string, { team: string, kills: number, matches: number }>();
    matches.forEach(match => {
      match.teams.forEach(team => {
        team.players.forEach(player => {
          const key = `${player.name}|||${team.teamName}`;
          const existing = statsMap.get(key) || { team: team.teamName, kills: 0, matches: 0 };
          statsMap.set(key, { team: team.teamName, kills: existing.kills + (Number(player.kills) || 0), matches: existing.matches + 1 });
        });
      });
    });
    return Array.from(statsMap.entries()).map(([key, data]) => ({
      playerName: key.split('|||')[0],
      teamName: data.team,
      matchesPlayed: data.matches,
      totalKills: data.kills,
      averageKills: Number((data.kills / data.matches).toFixed(2))
    })).sort((a, b) => b.totalKills - a.totalKills);
  };

  return {
    matches, mapSequence, availableMaps, roomID, isLoading,
    addMatch, resetMatches, clearData, createRoom, updateMaps, resetMaps, getGlobalTeamStats, getGlobalPlayerStats
  };
};
