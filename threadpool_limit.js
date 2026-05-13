const http = require('http');
const crypto = require('crypto');

const port = process.argv[2];

// Функція для імітації важкої обчислювальної задачі
function runHeavyTask() {
  return new Promise((resolve, reject) => {
    // pbkdf2 виконується у threadpool, а не в основному Event Loop
    crypto.pbkdf2('secret', 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve();
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/threadpool-limit') {
    const startTime = Date.now();
    const tasksCount = 8;

    try {
      // Створюємо масив із 8 задач
      const tasks = [];
      for (let i = 0; i < tasksCount; i++) {
        tasks.push(runHeavyTask());
      }

      // Запускаємо всі задачі паралельно
      await Promise.all(tasks);

      const durationMs = Date.now() - startTime;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        tasks: tasksCount,
        durationMs: durationMs
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