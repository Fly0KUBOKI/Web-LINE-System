// シンプルな静的ファイルサーバー（開発用）
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;

const server = http.createServer((req, res) => {
  // CORS ヘッダーを追加
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // ルートへのアクセスは index.html を返す
  let filePath = req.url === '/' ? '/public/index.html' : req.url;
  filePath = path.join(__dirname, filePath);

  // セキュリティ: ディレクトリトラバーサル対策
  const realPath = path.resolve(filePath);
  const realDir = path.resolve(__dirname);

  if (!realPath.startsWith(realDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // ファイルが存在するかチェック
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    // ファイルタイプに応じた Content-Type を設定
    const ext = path.extname(filePath);
    let contentType = 'text/plain';
    if (ext === '.html') contentType = 'text/html';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.json') contentType = 'application/json';

    res.setHeader('Content-Type', contentType);
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Dashboard server running at http://localhost:${PORT}`);
});
