const { isValidMove, isPathClear } = require('./chess-rules');

describe('isValidMove', () => {
  function emptyBoard() {
    return Array.from({ length: 8 }, () => Array(8).fill(null));
  }

  it('permite movimento simples de peão branco', () => {
    const board = emptyBoard();
    board[6][4] = 'P';
    expect(isValidMove(board, 6, 4, 5, 4)).toBe(true);
  });

  it('impede peão branco de andar para trás', () => {
    const board = emptyBoard();
    board[5][4] = 'P';
    expect(isValidMove(board, 5, 4, 6, 4)).toBe(false);
  });

  it('permite movimento em L do cavalo', () => {
    const board = emptyBoard();
    board[7][1] = 'N';
    expect(isValidMove(board, 7, 1, 5, 2)).toBe(true);
  });

  it('impede bispo de atravessar peças', () => {
    const board = emptyBoard();
    board[7][2] = 'B';
    board[6][3] = 'P';
    expect(isValidMove(board, 7, 2, 5, 4)).toBe(false);
  });

  it('permite torre andar em linha reta', () => {
    const board = emptyBoard();
    board[0][0] = 'R';
    expect(isValidMove(board, 0, 0, 0, 5)).toBe(true);
  });

  it('impede rainha de andar em L', () => {
    const board = emptyBoard();
    board[0][3] = 'Q';
    expect(isValidMove(board, 0, 3, 2, 4)).toBe(false);
  });

  it('permite rei andar uma casa', () => {
    const board = emptyBoard();
    board[0][4] = 'K';
    expect(isValidMove(board, 0, 4, 1, 4)).toBe(true);
  });
});

describe('isPathClear', () => {
  it('retorna true para caminho livre', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));
    expect(isPathClear(board, 0, 0, 0, 7)).toBe(true);
  });

  it('retorna false se houver peça no caminho', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));
    board[0][3] = 'P';
    expect(isPathClear(board, 0, 0, 0, 7)).toBe(false);
  });
});
