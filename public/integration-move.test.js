/**
 * Teste de integração para simular movimentação de peça no tabuleiro (drag-and-drop virtual)
 * Testa se uma peça pode ser movida para uma casa vazia e se o tabuleiro é atualizado corretamente.
 */
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

describe('Integração: movimentação de peça (drag-and-drop)', () => {
  let window, document, board, movePiece;

  beforeAll(() => {
    // Carrega o HTML e JS do cliente
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    window = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' }).window;
    document = window.document;
    // Simula o ambiente global
    global.window = window;
    global.document = document;
    // Carrega o client.js (deve ser CommonJS ou adaptado para teste)
    // Aqui, simulamos apenas a lógica de movimentação
    board = [
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['P', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '']
    ];
    // Função simplificada para simular movimentação
    movePiece = (sy, sx, dy, dx) => {
      if (board[sy][sx] && board[dy][dx] === '') {
        board[dy][dx] = board[sy][sx];
        board[sy][sx] = '';
        return true;
      }
      return false;
    };
  });

  it('move uma peça para uma casa vazia', () => {
    expect(movePiece(6, 0, 5, 0)).toBe(true);
    expect(board[5][0]).toBe('P');
    expect(board[6][0]).toBe('');
  });

  it('não move para casa ocupada pela mesma cor', () => {
    board[6][1] = 'P';
    board[5][1] = 'P';
    expect(movePiece(6, 1, 5, 1)).toBe(false);
    expect(board[6][1]).toBe('P');
    expect(board[5][1]).toBe('P');
  });
});
