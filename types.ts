
export interface Player {
  name: string;
  id: string;
  kills: number;
}

export interface Team {
  teamName: string;
  rank: number;
  killScore: number;
  rankScore: number;
  totalScore: number;
  players: Player[];
}

export interface Match {
  id: string;
  timestamp: number;
  teams: Team[];
}

export interface GlobalTeamStats {
  teamName: string;
  matchesPlayed: number;
  totalKills: number;
  totalRankPoints: number;
  totalPoints: number;
  averagePoints: number;
  totalBooyahs: number;
}

export interface GlobalPlayerStats {
  playerName: string;
  teamName: string;
  matchesPlayed: number;
  totalKills: number;
  averageKills: number;
}

export interface MapInfo {
  id: string;
  name: string;
  url: string;
}
