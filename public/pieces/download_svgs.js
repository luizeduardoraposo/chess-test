// Script Node.js para baixar SVGs das peças de xadrez do svgrepo.com e gerar versões pretas
const https = require('https');
const fs = require('fs');
const path = require('path');

const pieces = [
  { code: 'K', url: 'https://www.svgrepo.com/download/509812/chess-king.svg' },
  { code: 'Q', url: 'https://www.svgrepo.com/download/509815/chess-queen.svg' },
  { code: 'R', url: 'https://www.svgrepo.com/download/509816/chess-rook.svg' },
  { code: 'B', url: 'https://www.svgrepo.com/download/509809/chess-bishop.svg' },
  { code: 'N', url: 'https://www.svgrepo.com/download/509813/chess-knight.svg' },
  { code: 'P', url: 'https://www.svgrepo.com/download/509814/chess-pawn.svg' }
];

const outDir = path.join(__dirname);

function download(url, dest, cb) {
  https.get(url, res => {
    if (res.statusCode !== 200) return cb(new Error('Status ' + res.statusCode));
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      fs.writeFileSync(dest, data);
      cb(null, data);
    });
  }).on('error', cb);
}

function makeBlackSVG(svg) {
  // Troca fill para preto
  return svg.replace(/fill="#[0-9a-fA-F]{3,6}"/g, 'fill="#222"')
    .replace(/fill="white"/gi, 'fill="#222"')
    .replace(/fill="#fff"/gi, 'fill="#222"');
}

(async () => {
  for (const piece of pieces) {
    const whiteFile = path.join(outDir, `w${piece.code}.svg`);
    const blackFile = path.join(outDir, `b${piece.code}.svg`);
    await new Promise((resolve, reject) => {
      download(piece.url, whiteFile, (err, svg) => {
        if (err) return reject(err);
        // Gera versão preta
        const blackSVG = makeBlackSVG(svg);
        fs.writeFileSync(blackFile, blackSVG);
        console.log(`Baixado: w${piece.code}.svg e b${piece.code}.svg`);
        resolve();
      });
    });
  }
  console.log('Todas as peças baixadas!');
})();
