// Funções extraídas para testes unitários
function isValidMove(board, sy, sx, dy, dx) {
  const piece = board[sy][sx];
  if (!piece) return false;
  const isWhite = piece === piece.toUpperCase();
  const target = board[dy][dx];
  if (target && (target === target.toUpperCase()) === isWhite) return false;
  const dyAbs = Math.abs(dy - sy);
  const dxAbs = Math.abs(dx - sx);
  switch (piece.toLowerCase()) {
    case 'p':
      if (isWhite) {
        if (sx === dx && dy === sy - 1 && !target) return true;
        if (sx === dx && sy === 6 && dy === 4 && !target && !board[5][sx]) return true;
        if (dxAbs === 1 && dy === sy - 1 && target && target === target.toLowerCase()) return true;
      } else {
        if (sx === dx && dy === sy + 1 && !target) return true;
        if (sx === dx && sy === 1 && dy === 3 && !target && !board[2][sx]) return true;
        if (dxAbs === 1 && dy === sy + 1 && target && target === target.toUpperCase()) return true;
      }
      return false;
    case 'n':
      return (dxAbs === 2 && dyAbs === 1) || (dxAbs === 1 && dyAbs === 2);
    case 'b':
      if (dxAbs !== dyAbs) return false;
      return isPathClear(board, sy, sx, dy, dx);
    case 'r':
      if (sx !== dx && sy !== dy) return false;
      return isPathClear(board, sy, sx, dy, dx);
    case 'q':
      if (dxAbs === dyAbs || sx === dx || sy === dy) return isPathClear(board, sy, sx, dy, dx);
      return false;
    case 'k':
      if (dxAbs <= 1 && dyAbs <= 1) return true;
      return false;
    default:
      return false;
  }
}

function isPathClear(board, sy, sx, dy, dx) {
  const stepY = Math.sign(dy - sy);
  const stepX = Math.sign(dx - sx);
  let y = sy + stepY, x = sx + stepX;
  while (y !== dy || x !== dx) {
    if (board[y][x]) return false;
    if (y !== dy) y += stepY;
    if (x !== dx) x += stepX;
  }
  return true;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = { isValidMove, isPathClear };
} else {
  window.isValidMove = isValidMove;
  window.isPathClear = isPathClear;
}
