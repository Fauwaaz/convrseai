// import { createServer } from 'http';
// import { parse } from 'url';
// import next from 'next';

// const dev = process.env.NODE_ENV !== 'production';
// const port = process.env.PORT || 3001;

// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   createServer(async (req, res) => {
//     try {
//       const parsedUrl = parse(req.url, true);
//       await handle(req, res, parsedUrl);
//     } catch (err) {
//       console.error('❌ Server Error:', err);
//       res.statusCode = 500;
//       res.setHeader('Content-Type', 'text/html');
//       res.end('<h1>Internal Server Error</h1><p>Something went wrong, please try again later.</p>');
//     }
//   }).listen(port, (err) => {
//     if (err) throw err;
//     console.log(`✅ Server running on http://localhost:${port} (${dev ? 'development' : 'production'})`);
//   });
// });

import express from "express";
import next from "next";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.use((req, res) => handle(req, res));

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port} (${dev ? "dev" : "prod"})`);
  });
});