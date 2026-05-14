const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const port = process.argv[2];
const baseDir = process.cwd();

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/error-handling') {
    let body = '';

    req.on('data', chunk => { body += chunk.toString(); });

    req.on('end', async () => {
      let fileNames;
      
      // Перевірка на валідний JSON та масив
      try {
        fileNames = JSON.parse(body);
        if (!Array.isArray(fileNames)) throw new Error();
      } catch (e) {
        res.writeHead(400);
        return res.end();
      }

      // Створюємо проміси для читання кожного файлу
      const promises = fileNames.map(name => 
        fs.readFile(path.join(baseDir, name), 'utf8')
      );

      // Чекаємо завершення ВСІХ промісів (незалежно від успіху чи помилки)
      const results = await Promise.allSettled(promises);

      const successes = [];
      const failures = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successes.push(result.value.trim());
        } else {
          failures.push(fileNames[index]);
        }
      });

      // Повертаємо 200 навіть при часткових помилках
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        successes: successes,
        failures: failures,
        total: fileNames.length
      }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
