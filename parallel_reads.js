const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const port = process.argv[2];

// Зберігаємо шлях до робочої директорії
const baseDir = process.cwd();

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/parallel') {
    const startTime = Date.now();

    try {
      // 3. Створюємо масив промісів для паралельного читання
      const fileNames = ['a.txt', 'b.txt', 'c.txt'];
      const filePromises = fileNames.map(name => 
        fs.readFile(path.join(baseDir, name), 'utf8')
      );

      // 4. Чекаємо виконання всіх промісів одночасно
      const contents = await Promise.all(filePromises);

      const elapsedMs = Date.now() - startTime;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        combined: contents.map(text => text.trim()).join(''),
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
