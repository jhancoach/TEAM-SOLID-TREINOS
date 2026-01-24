
import { Team, Player } from './types';

export const parseLogFile = (content: string): Team[] => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const teams: Team[] = [];
  let currentTeam: Team | null = null;

  // Regex para capturar pares Chave: Valor de forma robusta
  const getMatch = (line: string, key: string) => {
    const regex = new RegExp(`^${key}\\s*:\\s*(.*)$`, 'i');
    const match = line.match(regex);
    return match ? match[1].trim() : null;
  };

  for (const line of lines) {
    // 1. Início de Time
    const teamName = getMatch(line, 'TeamName');
    if (teamName) {
      if (currentTeam) teams.push(currentTeam);
      currentTeam = {
        teamName,
        players: [],
        rank: 0,
        killScore: 0,
        rankScore: 0,
        totalScore: 0
      };
      continue;
    }

    if (!currentTeam) continue;

    // 2. Atributos do Time (Priorizamos nomes específicos para evitar conflitos)
    const killScore = getMatch(line, 'KillScore');
    if (killScore !== null) {
      currentTeam.killScore = parseInt(killScore) || 0;
      continue;
    }

    const rankScore = getMatch(line, 'RankScore');
    if (rankScore !== null) {
      currentTeam.rankScore = parseInt(rankScore) || 0;
      continue;
    }

    const totalScore = getMatch(line, 'TotalScore');
    if (totalScore !== null) {
      currentTeam.totalScore = parseInt(totalScore) || 0;
      continue;
    }

    const rank = getMatch(line, 'Rank');
    if (rank !== null) {
      currentTeam.rank = parseInt(rank) || 0;
      continue;
    }

    // 3. Atributos do Jogador
    const playerName = getMatch(line, 'Name');
    if (playerName) {
      currentTeam.players.push({
        name: playerName,
        id: '0',
        kills: 0
      });
      continue;
    }

    const playerId = getMatch(line, 'Id');
    if (playerId && currentTeam.players.length > 0) {
      currentTeam.players[currentTeam.players.length - 1].id = playerId;
      continue;
    }

    // Usamos regex mais específica para 'Kill' de jogador para não confundir com 'KillScore'
    const playerKills = getMatch(line, 'Kill');
    if (playerKills !== null && currentTeam.players.length > 0) {
      currentTeam.players[currentTeam.players.length - 1].kills = parseInt(playerKills) || 0;
      continue;
    }
  }

  if (currentTeam) teams.push(currentTeam);
  
  // LOG DE DEPURAÇÃO PARA O CONSOLE (Ajuda a identificar se o log está sendo lido)
  console.log("Times processados:", teams);
  
  return teams;
};
