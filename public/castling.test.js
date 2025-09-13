// Testes para roque (castling)
const { isValidMove } = require('./chess-rules');

describe('Roque (castling)', () => {
  function boardWithCastlingRights() {
    // Tabuleiro vazio, só peças necessárias
    const board = Array.from({ length: 8 }, () => Array(8).fill(''));
    board[7][4] = 'K'; // Rei branco
    board[7][0] = 'R'; // Torre a
    board[7][7] = 'R'; // Torre h
    board[0][4] = 'k'; // Rei preto
    board[0][0] = 'r'; // Torre a
    board[0][7] = 'r'; // Torre h
    return board;
  }

  it('não permite roque pelo isValidMove (deve ser tratado por isCastlingMove)', () => {
    const board = boardWithCastlingRights();
    // isValidMove não reconhece roque
    expect(isValidMove(board, 7, 4, 7, 6)).toBe(false);
    expect(isValidMove(board, 7, 4, 7, 2)).toBe(false);
    expect(isValidMove(board, 0, 4, 0, 6)).toBe(false);
    expect(isValidMove(board, 0, 4, 0, 2)).toBe(false);
  });

  // Testes de integração do roque são feitos no client.js, pois dependem de flags de movimento e lógica de interface
});
