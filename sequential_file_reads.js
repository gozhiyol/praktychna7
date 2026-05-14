const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2];

// Фіксуємо шлях до папки з файлами
const baseDir = process.cwd();

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/sequential') {
    const startTime = Date.now();

    try {
      // Читаємо файли послідовно (один за одним)
      // Використовуємо Sync для простоти або проміси, 
      // але для цього завдання важливо просто видати результат
      const a = fs.readFileSync(path.join(baseDir, 'a.txt'), 'utf8').trim();
      const b = fs.readFileSync(path.join(baseDir, 'b.txt'), 'utf8').trim();
      const c = fs.readFileSync(path.join(baseDir, 'c.txt'), 'utf8').trim();

      const elapsedMs = Date.now() - startTime;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        combined: a + b + c,
        elapsedMs: elapsedMs
      }));
    } catch (e) {
      res.writeHead(500);
      res.end();
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
