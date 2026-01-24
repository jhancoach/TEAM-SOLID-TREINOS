
import { Team, Player } from './types';

export const parseLogFile = (content: string): Team[] => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const teams: Team[] = [];
  let currentTeam: Partial<Team> | null = null;

  for (const line of lines) {
    // Detect Team Start
    if (line.toLowerCase().startsWith('teamname:')) {
      if (currentTeam && currentTeam.teamName) {
        teams.push(currentTeam as Team);
      }
      currentTeam = {
        teamName: line.split(':')[1].trim(),
        players: [],
        rank: 0,
        killScore: 0,
        rankScore: 0,
        totalScore: 0
      };
      continue;
    }

    if (!currentTeam) continue;

    // Detect Team Stats
    if (line.toLowerCase().startsWith('rank:')) {
      currentTeam.rank = parseInt(line.split(':')[1].trim()) || 0;
    } else if (line.toLowerCase().startsWith('killscore:')) {
      currentTeam.killScore = parseInt(line.split(':')[1].trim()) || 0;
    } else if (line.toLowerCase().startsWith('rankscore:')) {
      currentTeam.rankScore = parseInt(line.split(':')[1].trim()) || 0;
    } else if (line.toLowerCase().startsWith('totalscore:')) {
      currentTeam.totalScore = parseInt(line.split(':')[1].trim()) || 0;
    }

    // Detect Player Data (Assume players follow team stats)
    if (line.toLowerCase().startsWith('name:')) {
      const playerName = line.split(':')[1].trim();
      currentTeam.players?.push({
        name: playerName,
        id: '0', // Placeholder
        kills: 0
      });
    } else if (line.toLowerCase().startsWith('id:')) {
      if (currentTeam.players && currentTeam.players.length > 0) {
        currentTeam.players[currentTeam.players.length - 1].id = line.split(':')[1].trim();
      }
    } else if (line.toLowerCase().startsWith('kill:')) {
      if (currentTeam.players && currentTeam.players.length > 0) {
        currentTeam.players[currentTeam.players.length - 1].kills = parseInt(line.split(':')[1].trim()) || 0;
      }
    }
  }

  // Push the last team
  if (currentTeam && currentTeam.teamName) {
    teams.push(currentTeam as Team);
  }

  return teams;
};
