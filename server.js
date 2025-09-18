// Servidor WebSocket para Chess Online
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  if (ext === '.js') contentType = 'application/javascript';
  if (ext === '.css') contentType = 'text/css';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`[404] File not found: ${filePath}`);
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const wss = new WebSocket.Server({ server });
const games = {};

wss.on('connection', ws => {
          games[gameId].players.forEach(p => p.send(JSON.stringify({ action: 'start', gameId })));
  ws.on('message', message => {
    let data;
    try { data = JSON.parse(message); } catch (err) {
      console.error('Invalid JSON received:', message);
      ws.send(JSON.stringify({ action: 'error', message: 'Mensagem inválida.' }));
      return;
    }
    if (data.action === 'create') {
      const gameId = uuidv4();
      games[gameId] = { players: [ws], time: data.time };
      ws.gameId = gameId;
      ws.send(JSON.stringify({ action: 'invite-link', link: `ws://${server.address().address || 'localhost'}:3001?game=${gameId}` }));
      console.log(`Game created: ${gameId}`);
    } else if (data.action === 'join' && data.link) {
      const match = data.link.match(/game=([\w-]+)/);
      if (match) {
        const gameId = match[1];
        if (games[gameId] && games[gameId].players.length === 1) {
          games[gameId].players.push(ws);
          ws.gameId = gameId;
          // Notificar ambos jogadores
          games[gameId].players.forEach(p => p.send(JSON.stringify({ action: 'start', gameId })));
          console.log(`Player joined game: ${gameId}`);
        } else {
          ws.send(JSON.stringify({ action: 'error', message: 'Partida não encontrada ou cheia.' }));
        }
      }
    }
    // ...outras ações do jogo...
  });
  ws.on('close', () => {
    if (ws.gameId && games[ws.gameId]) {
      games[ws.gameId].players = games[ws.gameId].players.filter(p => p !== ws);
      if (games[ws.gameId].players.length === 0) delete games[ws.gameId];
    }
  });
});

server.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
