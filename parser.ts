
import { Team, Player } from './types';

export const parseLogFile = (content: string): Team[] => {
  // Divide o log em linhas, mas trataremos cada linha como um possível bloco de múltiplos dados
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const teams: Team[] = [];
  let currentTeam: Team | null = null;

  // Lista de todas as palavras-chave conhecidas para delimitar a captura
  const keywords = [
    'TeamName', 'RankScore', 'KillScore', 'TotalScore', 'Rank', 
    'Name', 'Id', 'Kill'
  ];

  /**
   * Extrai o valor de uma chave específica dentro de um texto, 
   * parando assim que encontrar outra chave da lista ou o fim da linha.
   */
  const extractValue = (text: string, key: string): string | null => {
    // Regex: Procura a Chave:, captura tudo depois dela ATÉ encontrar outra Chave: ou fim da string
    const pattern = `${key}\\s*:\\s*(.*?)(?=\\s+(?:${keywords.join('|')})\\s*:|$)`;
    const regex = new RegExp(pattern, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  for (const line of lines) {
    // 1. Verificar se a linha contém o início de um novo time
    const teamName = extractValue(line, 'TeamName');
    
    if (teamName) {
      // Salva o time anterior se existir
      if (currentTeam) teams.push(currentTeam);
      
      // Inicializa novo time
      currentTeam = {
        teamName: teamName,
        players: [],
        rank: 0,
        killScore: 0,
        rankScore: 0,
        totalScore: 0
      };
    }

    if (!currentTeam) continue;

    // 2. Extrair atributos do time (podem estar na mesma linha do TeamName ou em linhas separadas)
    const rank = extractValue(line, 'Rank');
    if (rank !== null) currentTeam.rank = parseInt(rank) || currentTeam.rank;

    const killScore = extractValue(line, 'KillScore');
    if (killScore !== null) currentTeam.killScore = parseInt(killScore) || currentTeam.killScore;

    const rankScore = extractValue(line, 'RankScore');
    if (rankScore !== null) currentTeam.rankScore = parseInt(rankScore) || currentTeam.rankScore;

    const totalScore = extractValue(line, 'TotalScore');
    if (totalScore !== null) currentTeam.totalScore = parseInt(totalScore) || currentTeam.totalScore;

    // 3. Verificar Jogadores
    const playerName = extractValue(line, 'Name');
    if (playerName) {
      // Extrai os dados do jogador que geralmente acompanham o Name na mesma linha
      const pId = extractValue(line, 'Id') || '0';
      const pKills = extractValue(line, 'Kill') || '0';

      currentTeam.players.push({
        name: playerName,
        id: pId,
        kills: parseInt(pKills) || 0
      });
    } else {
      // Caso o ID ou Kill venham em linhas separadas após o Name
      if (currentTeam.players.length > 0) {
        const lastPlayer = currentTeam.players[currentTeam.players.length - 1];
        const pId = extractValue(line, 'Id');
        if (pId) lastPlayer.id = pId;
        
        const pKills = extractValue(line, 'Kill');
        if (pKills) lastPlayer.kills = parseInt(pKills) || lastPlayer.kills;
      }
    }
  }

  // Adiciona o último time processado
  if (currentTeam) teams.push(currentTeam);
  
  console.log("Parsing finalizado. Total de times:", teams.length);
  return teams;
};
