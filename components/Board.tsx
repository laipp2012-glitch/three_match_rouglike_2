import React, { memo } from 'react';
import { Tile, Position } from '../types';

interface BoardProps {
  grid: Tile[][];
  onTileClick: (row: number, col: number) => void;
  selectedTile: Position | null;
  isAnimating: boolean;
}

// Выносим отдельную плитку в мемоизированный компонент.
// Это критически важно, чтобы при обновлении одной плитки React не перерисовывал все 64.
interface BoardTileProps {
    tile: Tile;
    row: number;
    col: number;
    isSelected: boolean;
    onClick: (r: number, c: number) => void;
}

const BoardTile = memo(({ tile, row, col, isSelected, onClick }: BoardTileProps) => {
    const modifier = tile.modifier;
    
    let modifierStyles = "";
    let badgeIcon = null;
    let bgEffect = "bg-white/5";

    if (modifier === 'fire') {
      modifierStyles = "special-fire border-red-500/50 border";
      bgEffect = "bg-gradient-to-br from-red-900/20 to-orange-900/20";
      badgeIcon = "🔥";
    } else if (modifier === 'lightning') {
      modifierStyles = "special-lightning border-blue-400/50 border";
      bgEffect = "bg-gradient-to-br from-blue-900/20 to-cyan-900/20";
      badgeIcon = "⚡";
    } else if (modifier === 'star') {
      modifierStyles = "special-star border-yellow-400/50 border";
      bgEffect = "bg-gradient-to-br from-yellow-700/20 to-purple-900/20";
      badgeIcon = "⭐";
    }

    return (
      <div 
        onClick={() => onClick(row, col)}
        className={`aspect-square flex items-center justify-center text-xl sm:text-2xl cursor-pointer rounded-2xl transition-all duration-200 relative will-change-transform
          ${isSelected ? 'bg-white/30 ring-4 ring-white scale-110 z-20 shadow-2xl' : `hover:brightness-125 ${bgEffect}`}
          ${modifierStyles}
          ${tile.emoji === '' ? 'opacity-0 scale-50' : 'opacity-100'}`}
      >
        {/* Основной эмодзи */}
        <span className={`tile-pop select-none z-10 ${modifier !== 'none' ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`}>
          {tile.emoji}
        </span>
        
        {/* Черный круг с иконкой модификатора в углу */}
        {modifier !== 'none' && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-black border border-white/20 rounded-full flex items-center justify-center shadow-lg z-20 scale-90">
            <span className="text-[10px] drop-shadow-sm leading-none flex items-center justify-center">
              {badgeIcon}
            </span>
          </div>
        )}

        {/* Дополнительный визуальный слой для свечения всей плитки */}
        {modifier !== 'none' && (
            <div className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none mix-blend-screen bg-white"></div>
        )}
      </div>
    );
}, (prev, next) => {
    // Кастомная функция сравнения для максимальной скорости
    return (
        prev.tile === next.tile && // Ссылка на объект тайла (если неизменен, ссылка та же)
        prev.tile.id === next.tile.id &&
        prev.tile.emoji === next.tile.emoji &&
        prev.tile.modifier === next.tile.modifier &&
        prev.isSelected === next.isSelected
    );
});

const Board: React.FC<BoardProps> = ({ grid, onTileClick, selectedTile, isAnimating }) => {
  return (
    <div className="grid grid-cols-8 gap-1.5 p-2 bg-black/60 rounded-[2.5rem] border border-white/10 shadow-2xl mb-8 relative">
      {grid.map((row, r) => row.map((tile, c) => (
         <BoardTile 
            key={tile.id || `${r}-${c}`} // Используем ID если есть, но fallback на координаты для стабильности
            tile={tile}
            row={r}
            col={c}
            isSelected={selectedTile?.row === r && selectedTile?.col === c}
            onClick={onTileClick}
         />
      )))}
    </div>
  );
};

// Мемоизируем весь Board, чтобы он не рендерился, когда меняется только статистика (HP/Mana)
export default memo(Board);