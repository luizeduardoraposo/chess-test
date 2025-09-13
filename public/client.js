

window.addEventListener('DOMContentLoaded', () => {
  // Drag and drop de peças
  let dragging = null;
  let dragOffset = null;
  let dragPiece = null;

  const socket = new WebSocket('ws://' + window.location.hostname + ':3001');

  const boardThemes = [
    { name: 'Clássico', light: '#f0d9b5', dark: '#b58863' },
    { name: 'Azul', light: '#aadfff', dark: '#005577' },
    { name: 'Verde', light: '#b6e3b6', dark: '#3a5d3a' },
    { name: 'Escuro', light: '#444', dark: '#222' }
  ];
  // Só SVG
  const pieceThemes = [
    { name: 'SVG', set: 'svg' }
  ];

  let boardTheme = boardThemes[0];
  let pieceTheme = pieceThemes[0];

  const boardThemeSelect = document.getElementById('board-theme');
  const pieceThemeSelect = document.getElementById('piece-theme');
  const canvas = document.getElementById('chessboard');
  const ctx = canvas.getContext('2d');

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
  // Não há troca de tema, só SVG

  function resizeBoard() {
    const size = Math.floor(0.9 * Math.min(window.innerWidth, window.innerHeight));
    canvas.width = size;
    canvas.height = size;
    drawBoard();
  }
  window.addEventListener('resize', resizeBoard);

  // Posição inicial do tabuleiro (FEN simplificado)
  let board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];
  // Flags para roque: se rei ou torres já se moveram
  let whiteKingMoved = false, blackKingMoved = false;
  let whiteRookAMoved = false, whiteRookHMoved = false;
  let blackRookAMoved = false, blackRookHMoved = false;

  // Carregar imagens SVG das peças
  const pieceImages = {};
  const pieceFiles = {
    K: 'wK.svg', Q: 'wQ.svg', R: 'wR.svg', B: 'wB.svg', N: 'wN.svg', P: 'wP.svg',
    k: 'bK.svg', q: 'bQ.svg', r: 'bR.svg', b: 'bB.svg', n: 'bN.svg', p: 'bP.svg'
  };
  function loadPieceImages(callback) {
    let loaded = 0, total = Object.keys(pieceFiles).length;
    for (const [piece, file] of Object.entries(pieceFiles)) {
      const img = new Image();
      img.onload = () => { loaded++; if (loaded === total && callback) callback(); };
      img.onerror = () => { loaded++; if (loaded === total && callback) callback(); };
      img.src = `pieces/${file}`;
      pieceImages[piece] = img;
    }
  }

  function drawBoard(evt) {
    const size = canvas.width;
    const square = size / 8;
    ctx.clearRect(0, 0, size, size);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? boardTheme.light : boardTheme.dark;
        ctx.fillRect(x * square, y * square, square, square);
        // Desenhar peça SVG se houver
        const piece = board[y][x];
        if (piece && (!dragging || dragging[0] !== y || dragging[1] !== x)) {
          if (pieceImages[piece] && pieceImages[piece].complete && pieceImages[piece].naturalWidth > 0) {
            ctx.drawImage(pieceImages[piece], x * square + square * 0.1, y * square + square * 0.1, square * 0.8, square * 0.8);
          }
        }
      }
    }
    // Desenhar peça arrastando
    if (dragging && dragPiece && evt) {
      const rect = canvas.getBoundingClientRect();
      const mx = evt.clientX - rect.left - dragOffset[0] + square * 0.1;
      const my = evt.clientY - rect.top - dragOffset[1] + square * 0.1;
      if (pieceImages[dragPiece] && pieceImages[dragPiece].complete && pieceImages[dragPiece].naturalWidth > 0) {
        ctx.globalAlpha = 0.7;
        ctx.drawImage(pieceImages[dragPiece], mx, my, square * 0.8, square * 0.8);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  canvas.addEventListener('mousedown', function (evt) {
    const rect = canvas.getBoundingClientRect();
    const size = canvas.width;
    const square = size / 8;
    const x = Math.floor((evt.clientX - rect.left) / square);
    const y = Math.floor((evt.clientY - rect.top) / square);
    if (board[y][x]) {
      dragging = [y, x];
      dragPiece = board[y][x];
      dragOffset = [evt.clientX - (rect.left + x * square), evt.clientY - (rect.top + y * square)];
    }
  });

  canvas.addEventListener('mousemove', function (evt) {
    if (dragging) {
      drawBoard(evt);
    }
  });


  canvas.addEventListener('mouseup', function (evt) {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const size = canvas.width;
    const square = size / 8;
    const x = Math.floor((evt.clientX - rect.left) / square);
    const y = Math.floor((evt.clientY - rect.top) / square);
    const [sy, sx] = dragging;
    if ((sy !== y || sx !== x) && board[sy][sx]) {
      if (isValidMove(board, sy, sx, y, x) || isCastlingMove(sy, sx, y, x)) {
        // Roque
        if (isCastlingMove(sy, sx, y, x)) {
          if (board[sy][sx] === 'K' && sy === 7 && sx === 4 && y === 7 && (x === 6 || x === 2)) {
            // Branco
            if (x === 6) { // Roque curto
              board[7][6] = 'K'; board[7][5] = 'R'; board[7][4] = ''; board[7][7] = '';
              whiteKingMoved = true; whiteRookHMoved = true;
            } else if (x === 2) { // Roque longo
              board[7][2] = 'K'; board[7][3] = 'R'; board[7][4] = ''; board[7][0] = '';
              whiteKingMoved = true; whiteRookAMoved = true;
            }
          } else if (board[sy][sx] === 'k' && sy === 0 && sx === 4 && y === 0 && (x === 6 || x === 2)) {
            // Preto
            if (x === 6) { // Roque curto
              board[0][6] = 'k'; board[0][5] = 'r'; board[0][4] = ''; board[0][7] = '';
              blackKingMoved = true; blackRookHMoved = true;
            } else if (x === 2) { // Roque longo
              board[0][2] = 'k'; board[0][3] = 'r'; board[0][4] = ''; board[0][0] = '';
              blackKingMoved = true; blackRookAMoved = true;
            }
          }
        } else {
          // Movimento normal
          board[y][x] = board[sy][sx];
          board[sy][sx] = '';
          // Atualizar flags de movimento para roque
          if (board[y][x] === 'K') whiteKingMoved = true;
          if (board[y][x] === 'k') blackKingMoved = true;
          if (board[y][x] === 'R' && sy === 7 && sx === 0) whiteRookAMoved = true;
          if (board[y][x] === 'R' && sy === 7 && sx === 7) whiteRookHMoved = true;
          if (board[y][x] === 'r' && sy === 0 && sx === 0) blackRookAMoved = true;
          if (board[y][x] === 'r' && sy === 0 && sx === 7) blackRookHMoved = true;
          // Promoção de peão
          if ((board[y][x] === 'P' && y === 0) || (board[y][x] === 'p' && y === 7)) {
            promoverPeao(y, x);
          }
        }
        // TODO: en passant, xeque, xeque-mate
      }
    }

    dragging = null;
    dragPiece = null;
    dragOffset = null;
    drawBoard();
  });

  // Verifica se o movimento é um roque válido
  function isCastlingMove(sy, sx, dy, dx) {
    // Branco
    if (sy === 7 && sx === 4 && dy === 7 && (dx === 6 || dx === 2) && board[sy][sx] === 'K') {
      if (whiteKingMoved) return false;
      if (dx === 6 && !whiteRookHMoved && board[7][5] === '' && board[7][6] === '' && board[7][7] === 'R') return true;
      if (dx === 2 && !whiteRookAMoved && board[7][1] === '' && board[7][2] === '' && board[7][3] === '' && board[7][0] === 'R') return true;
    }
    // Preto
    if (sy === 0 && sx === 4 && dy === 0 && (dx === 6 || dx === 2) && board[sy][sx] === 'k') {
      if (blackKingMoved) return false;
      if (dx === 6 && !blackRookHMoved && board[0][5] === '' && board[0][6] === '' && board[0][7] === 'r') return true;
      if (dx === 2 && !blackRookAMoved && board[0][1] === '' && board[0][2] === '' && board[0][3] === '' && board[0][0] === 'r') return true;
    }
    return false;
  }

  // Função para promover peão ao chegar na última fileira
  function promoverPeao(y, x) {
    // Simples: sempre promove para rainha
    board[y][x] = board[y][x] === 'P' ? 'Q' : 'q';
    drawBoard();
    // Para escolha de peça, implementar UI futura
  }

  // Função de validação de movimento (regras básicas)
  // ...existing code...
  // As funções isValidMove e isPathClear agora estão em chess-rules.js para facilitar testes.

  loadPieceImages(resizeBoard);

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
});

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
