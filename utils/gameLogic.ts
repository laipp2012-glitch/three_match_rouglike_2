import { GRID_SIZE, EMOJIS, Tile, Position, TileModifier } from '../types';

export const getRandomEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

export const createTile = (emoji = getRandomEmoji(), modifier: TileModifier = 'none'): Tile => ({
  id: Math.random().toString(36).substr(2, 9),
  emoji,
  modifier
});

export const createInitialGrid = (): Tile[][] => {
  let grid: Tile[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      let emoji;
      do {
        emoji = getRandomEmoji();
      } while (
        (r >= 2 && grid[r - 1][c].emoji === emoji && grid[r - 2][c].emoji === emoji) ||
        (c >= 2 && grid[r][c - 1].emoji === emoji && grid[r][c - 2].emoji === emoji)
      );
      grid[r][c] = createTile(emoji);
    }
  }
  return grid;
};

// Deep clone to prevent state mutation bugs
export const cloneGrid = (grid: Tile[][]): Tile[][] => {
  return grid.map(row => row.map(tile => ({ ...tile })));
};

export interface MatchGroup {
  type: 'row' | 'col';
  tiles: Position[];
}

export const findMatches = (grid: Tile[][]): MatchGroup[] => {
  const matches: MatchGroup[] = [];

  // Horizontal
  for (let r = 0; r < GRID_SIZE; r++) {
    let count = 1;
    for (let c = 1; c <= GRID_SIZE; c++) {
      if (c < GRID_SIZE && grid[r][c].emoji === grid[r][c - 1].emoji && grid[r][c].emoji !== '') {
        count++;
      } else {
        if (count >= 3) {
          const tiles: Position[] = [];
          for (let i = 1; i <= count; i++) tiles.push({ row: r, col: c - i });
          matches.push({ type: 'row', tiles });
        }
        count = 1;
      }
    }
  }

  // Vertical
  for (let c = 0; c < GRID_SIZE; c++) {
    let count = 1;
    for (let r = 1; r <= GRID_SIZE; r++) {
      if (r < GRID_SIZE && grid[r][c].emoji === grid[r - 1][c].emoji && grid[r][c].emoji !== '') {
        count++;
      } else {
        if (count >= 3) {
          const tiles: Position[] = [];
          for (let i = 1; i <= count; i++) tiles.push({ row: r - i, col: c });
          matches.push({ type: 'col', tiles });
        }
        count = 1;
      }
    }
  }

  return matches;
};

export const areAdjacent = (p1: Position, p2: Position): boolean => {
  return Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col) === 1;
};

export const getAffectedPositions = (r: number, c: number, modifier: TileModifier, emoji: string, currentGrid: Tile[][]): Position[] => {
  let affected: Position[] = [];
  if (modifier === 'fire') {
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      let nr = r + i, nc = c + j;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) affected.push({ row: nr, col: nc });
    }
  } else if (modifier === 'lightning') {
    for (let i = 0; i < GRID_SIZE; i++) {
      affected.push({ row: i, col: c });
      affected.push({ row: r, col: i });
    }
  } else if (modifier === 'star') {
    for (let i = 0; i < GRID_SIZE; i++) for (let j = 0; j < GRID_SIZE; j++) {
      if (currentGrid[i][j].emoji === emoji) affected.push({ row: i, col: j });
    }
  }
  return affected;
};