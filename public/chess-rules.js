// Verifica se o rei da cor está em xeque
function isKingInCheck(board, isWhite) {
  let kingY = -1, kingX = -1;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.toLowerCase() === 'k' && (piece === piece.toUpperCase()) === isWhite) {
        kingY = y; kingX = x;
      }
    }
  }
  if (kingY === -1) return false;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && (piece === piece.toUpperCase()) !== isWhite) {
        if (isValidMove(board, y, x, kingY, kingX)) return true;
      }
    }
  }
  return false;
}

// Verifica se a cor está em xeque-mate
function isCheckmate(board, isWhite) {
  if (!isKingInCheck(board, isWhite)) return false;
  // Localiza a posição do rei
  let kingY = -1, kingX = -1;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.toLowerCase() === 'k' && (piece === piece.toUpperCase()) === isWhite) {
        kingY = y; kingX = x;
      }
    }
  }
  // Testa todos os movimentos possíveis das peças da cor
  for (let sy = 0; sy < 8; sy++) {
    for (let sx = 0; sx < 8; sx++) {
      const piece = board[sy][sx];
      if (piece && (piece === piece.toUpperCase()) === isWhite) {
        for (let dy = 0; dy < 8; dy++) {
          for (let dx = 0; dx < 8; dx++) {
            if (isValidMove(board, sy, sx, dy, dx)) {
              // Se for o rei, só permite mover para casas não atacadas
              if (piece.toLowerCase() === 'k') {
                // Simula o movimento do rei
                const copy = board.map(row => [...row]);
                copy[dy][dx] = copy[sy][sx];
                copy[sy][sx] = '';
                // O rei está em (dy, dx) agora
                if (!isKingInCheck(copy, isWhite)) {
                  return false;
                }
              } else {
                // Simula o movimento de outra peça
                const copy = board.map(row => row.slice());
                copy[dy][dx] = copy[sy][sx];
                copy[sy][sx] = '';
                // O rei permanece na mesma posição
                if (!isKingInCheck(copy, isWhite)) {
                  return false;
                }
              }
            }
          }
        }
      }
    }
  }
  return true;
}
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
      if (dxAbs <= 1 && dyAbs <= 1) {
        // O rei não pode mover para casa atacada
        // Simula o movimento do rei
        const copy = board.map(row => row.slice());
        copy[dy][dx] = copy[sy][sx];
        copy[sy][sx] = '';
        // Verifica se a casa destino está sob ataque
        if (isKingInCheck(copy, isWhite)) return false;
        return true;
      }
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
  module.exports = { isValidMove, isPathClear, isKingInCheck, isCheckmate };
} else {
  window.isValidMove = isValidMove;
  window.isPathClear = isPathClear;
  window.isKingInCheck = isKingInCheck;
  window.isCheckmate = isCheckmate;
}
