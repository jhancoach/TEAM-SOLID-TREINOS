
import { useState, useEffect } from 'react';
import { Match, GlobalTeamStats, GlobalPlayerStats, Team } from './types';

const STORAGE_KEY = 'team_solid_data_v1';

export const useMatchStore = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMatches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load matches", e);
      }
    }
  }, []);

  // Save to localStorage whenever matches update
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  }, [matches]);

  const addMatch = (teams: Team[]) => {
    const newMatch: Match = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      teams: teams
    };
    setMatches(prev => [...prev, newMatch]);
  };

  const clearData = () => {
    if (confirm("Tem certeza que deseja apagar todo o histórico?")) {
      setMatches([]);
    }
  };

  const getGlobalTeamStats = (): GlobalTeamStats[] => {
    const statsMap = new Map<string, { kills: number, points: number, matches: number }>();

    matches.forEach(match => {
      match.teams.forEach(team => {
        const existing = statsMap.get(team.teamName) || { kills: 0, points: 0, matches: 0 };
        statsMap.set(team.teamName, {
          kills: existing.kills + (team.killScore || 0),
          points: existing.points + (team.totalScore || 0),
          matches: existing.matches + 1
        });
      });
    });

    return Array.from(statsMap.entries()).map(([name, data]) => ({
      teamName: name,
      matchesPlayed: data.matches,
      totalKills: data.kills,
      totalPoints: data.points,
      averagePoints: Number((data.points / data.matches).toFixed(2))
    })).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const getGlobalPlayerStats = (): GlobalPlayerStats[] => {
    const statsMap = new Map<string, { team: string, kills: number, matches: number }>();

    matches.forEach(match => {
      match.teams.forEach(team => {
        team.players.forEach(player => {
          const key = `${player.name}_${team.teamName}`;
          const existing = statsMap.get(key) || { team: team.teamName, kills: 0, matches: 0 };
          statsMap.set(key, {
            team: team.teamName,
            kills: existing.kills + (player.kills || 0),
            matches: existing.matches + 1
          });
        });
      });
    });

    return Array.from(statsMap.entries()).map(([key, data]) => ({
      playerName: key.split('_')[0],
      teamName: data.team,
      matchesPlayed: data.matches,
      totalKills: data.kills,
      averageKills: Number((data.kills / data.matches).toFixed(2))
    })).sort((a, b) => {
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return b.averageKills - a.averageKills;
    });
  };

  return {
    matches,
    addMatch,
    clearData,
    getGlobalTeamStats,
    getGlobalPlayerStats
  };
};
