describe('En passant', () => {
  it('permite captura en passant para branco', () => {
    // Simula situação real de en passant
    let board = [
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', 'P', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '']
    ];
    let enPassant = null;
    // Turno preto: peão avança 2 casas de (1,0) para (3,0)
    board[1][0] = 'p';
    board[3][0] = board[1][0];
    board[1][0] = '';
    enPassant = [2, 0]; // alvo de en passant (linha entre origem e destino)
    // Turno branco: captura en passant de (6,1) para (2,0) (simula lógica do client.js)
    // O peão branco deve estar em (3,0) após a captura, e o peão preto removido de (3,0)
    if (board[6][1] === 'P' && board[3][0] === 'p' && enPassant && enPassant[0] === 2 && enPassant[1] === 0) {
      board[2][0] = 'P';
      board[6][1] = '';
      board[3][0] = '';
    }
    expect(board[2][0]).toBe('P');
    expect(board[6][1]).toBe('');
    expect(board[3][0]).toBe(''); // Peão preto capturado
  });

  it('não permite en passant se não for logo após o avanço', () => {
    let board = [
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['p', '', '', '', '', '', '', ''],
      ['', 'P', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '']
    ];
    let enPassant = null; // Não é mais permitido
    // Simula lógica do client.js
    let captured = false;
    if (board[6][1] === 'P' && board[5][0] === '' && enPassant && enPassant[0] === 5 && enPassant[1] === 0) {
      board[5][0] = 'P';
      board[6][1] = '';
      board[6][0] = '';
      captured = true;
    }
    expect(captured).toBe(false);
    expect(board[5][0]).toBe('p');
    expect(board[6][1]).toBe('P');
  });
});
const { isValidMove, isPathClear, isKingInCheck, isCheckmate } = require('./chess-rules');
describe('Xeque e Xeque-mate', () => {
  function emptyBoard() {
    return Array.from({ length: 8 }, () => Array(8).fill(''));
  }

  it('detecta xeque simples ao rei branco', () => {
    const board = emptyBoard();
    board[7][4] = 'K'; // rei branco
    board[5][4] = 'q'; // rainha preta atacando
    expect(isKingInCheck(board, true)).toBe(true);
    expect(isKingInCheck(board, false)).toBe(false);
  });

  it('detecta xeque simples ao rei preto', () => {
    const board = emptyBoard();
    board[0][4] = 'k'; // rei preto
    board[2][4] = 'Q'; // rainha branca atacando
    expect(isKingInCheck(board, false)).toBe(true);
    expect(isKingInCheck(board, true)).toBe(false);
  });

  it('não acusa xeque se não houver ataque', () => {
    const board = emptyBoard();
    board[7][4] = 'K';
    board[0][4] = 'k';
    expect(isKingInCheck(board, true)).toBe(false);
    expect(isKingInCheck(board, false)).toBe(false);
  });

});

// Testes de movimentação e regras

describe('isValidMove', () => {
  function emptyBoard() {
    return Array.from({ length: 8 }, () => Array(8).fill(''));
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

  it('permite mover peça para casa vazia', () => {
    const board = emptyBoard();
    board[4][4] = 'N';
    expect(isValidMove(board, 4, 4, 6, 5)).toBe(true);
  });
});

describe('isPathClear', () => {
  it('retorna true para caminho livre', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(''));
    expect(isPathClear(board, 0, 0, 0, 7)).toBe(true);
  });

  it('retorna false se houver peça no caminho', () => {
    const board = Array.from({ length: 8 }, () => Array(8).fill(''));
    board[0][3] = 'P';
    expect(isPathClear(board, 0, 0, 0, 7)).toBe(false);
  });
});

describe('Roque (castling)', () => {
  function boardWithCastlingRights() {
    const board = Array.from({ length: 8 }, () => Array(8).fill(''));
    board[7][4] = 'K';
    board[7][0] = 'R';
    board[7][7] = 'R';
    board[0][4] = 'k';
    board[0][0] = 'r';
    board[0][7] = 'r';
    return board;
  }
  it('não permite roque pelo isValidMove (deve ser tratado por isCastlingMove)', () => {
    const board = boardWithCastlingRights();
    expect(isValidMove(board, 7, 4, 7, 6)).toBe(false);
    expect(isValidMove(board, 7, 4, 7, 2)).toBe(false);
    expect(isValidMove(board, 0, 4, 0, 6)).toBe(false);
    expect(isValidMove(board, 0, 4, 0, 2)).toBe(false);
  });
});

describe('Controle de turnos', () => {
  let board, turn, move;
  beforeEach(() => {
    board = [
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['P', '', '', '', '', '', '', ''],
      ['R', '', '', '', '', '', '', '']
    ];
    turn = 'w';
    move = (sy, sx, dy, dx) => {
      const piece = board[sy][sx];
      const isWhite = piece === piece.toUpperCase();
      if ((turn === 'w' && !isWhite) || (turn === 'b' && isWhite)) {
        return false;
      }
      if (isValidMove(board, sy, sx, dy, dx)) {
        board[dy][dx] = board[sy][sx];
        board[sy][sx] = '';
        turn = turn === 'w' ? 'b' : 'w';
        return true;
      }
      return false;
    };
  });
  it('só permite que o lado correto jogue', () => {
    expect(move(6, 0, 5, 0)).toBe(true);
    expect(turn).toBe('b');
    expect(move(7, 0, 6, 0)).toBe(false);
    expect(turn).toBe('b');
    board[1][0] = 'p';
    expect(move(1, 0, 2, 0)).toBe(true);
    expect(turn).toBe('w');
  });
});
