// Teste unitário para controle de turnos

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
    // Função simulada de movimento com controle de turno
    move = (sy, sx, dy, dx) => {
      const piece = board[sy][sx];
      const isWhite = piece === piece.toUpperCase();
      if ((turn === 'w' && !isWhite) || (turn === 'b' && isWhite)) {
        return false;
      }
      if (typeof isValidMove === 'function' && isValidMove(board, sy, sx, dy, dx)) {
        board[dy][dx] = board[sy][sx];
        board[sy][sx] = '';
        turn = turn === 'w' ? 'b' : 'w';
        return true;
      }
      return false;
    };
  });

  it('só permite que o lado correto jogue', () => {
    // Branco começa
    expect(move(6, 0, 5, 0)).toBe(true); // Branco move
    expect(turn).toBe('b');
    // Tentar mover branco de novo
    expect(move(7, 0, 6, 0)).toBe(false);
    expect(turn).toBe('b');
    // Preto não tem peça, simula adicionar uma
    board[1][0] = 'p';
    expect(move(1, 0, 2, 0)).toBe(true); // Preto move
    expect(turn).toBe('w');
  });
});
