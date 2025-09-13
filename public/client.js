// Chess client logic
const socket = new WebSocket('ws://' + window.location.hostname + ':3001');

const boardThemes = [
  { name: 'Clássico', light: '#f0d9b5', dark: '#b58863' },
  { name: 'Azul', light: '#aadfff', dark: '#005577' },
  { name: 'Verde', light: '#b6e3b6', dark: '#3a5d3a' },
  { name: 'Escuro', light: '#444', dark: '#222' }
];
const pieceThemes = [
  { name: 'Padrão', set: 'default' },
  { name: 'Minimalista', set: 'minimal' }
];

let boardTheme = boardThemes[0];
let pieceTheme = pieceThemes[0];

const boardThemeSelect = document.getElementById('board-theme');
const pieceThemeSelect = document.getElementById('piece-theme');

boardThemes.forEach((theme, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = theme.name;
  boardThemeSelect.appendChild(opt);
});
pieceThemes.forEach((theme, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = theme.name;
  pieceThemeSelect.appendChild(opt);
});

boardThemeSelect.addEventListener('change', e => {
  boardTheme = boardThemes[parseInt(e.target.value)];
  drawBoard();
});
pieceThemeSelect.addEventListener('change', e => {
  pieceTheme = pieceThemes[parseInt(e.target.value)];
  drawBoard();
});

const canvas = document.getElementById('chessboard');
const ctx = canvas.getContext('2d');

function resizeBoard() {
  const size = Math.floor(0.9 * Math.min(window.innerWidth, window.innerHeight));
  canvas.width = size;
  canvas.height = size;
  drawBoard();
}
window.addEventListener('resize', resizeBoard);


// Posição inicial do tabuleiro (FEN simplificado)
let board = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['','','','','','','',''],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

// Mapeamento de peças para Unicode
const pieceUnicode = {
  K: '\u2654', Q: '\u2655', R: '\u2656', B: '\u2657', N: '\u2658', P: '\u2659',
  k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F'
};

function drawBoard() {
  const size = canvas.width;
  const square = size / 8;
  ctx.clearRect(0, 0, size, size);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? boardTheme.light : boardTheme.dark;
      ctx.fillRect(x * square, y * square, square, square);
      // Desenhar peça se houver
      const piece = board[y][x];
      if (piece) {
        ctx.font = `${Math.floor(square * 0.8)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = /[A-Z]/.test(piece) ? '#fff' : '#222';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        const code = pieceUnicode[piece];
        if (code) {
          // Desenhar contorno para melhor contraste
          ctx.strokeText(String.fromCharCode(parseInt(code.replace('\\u',''),16)),
            x * square + square/2, y * square + square/2);
          ctx.fillText(String.fromCharCode(parseInt(code.replace('\\u',''),16)),
            x * square + square/2, y * square + square/2);
        }
      }
    }
  }
}

resizeBoard();

document.getElementById('create-game').onclick = () => {
  const hours = parseInt(document.getElementById('hours').value) || 0;
  const minutes = parseInt(document.getElementById('minutes').value) || 0;
  const seconds = parseInt(document.getElementById('seconds').value) || 0;
  socket.send(JSON.stringify({ action: 'create', time: { hours, minutes, seconds } }));
};
document.getElementById('join-game').onclick = () => {
  const link = document.getElementById('join-link').value.trim();
  if (link) {
    socket.send(JSON.stringify({ action: 'join', link }));
  }
};

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.action === 'invite-link') {
    document.getElementById('invite-link').textContent = 'Link: ' + msg.link;
  }
  // ...outras mensagens do servidor...
};

// ...restante da lógica do jogo, movimentação, timer, etc...
