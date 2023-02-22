import path from 'path';
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import mysql from 'mysql';

const app = express();
const httpServer = http.createServer(app);
const pool = mysql.createPool({
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  host: '85.10.205.173',
  user: 'team4real',
  password: 'isthistherealworld',
});

app.use(express.static('public'));
app.use('/static', express.static('public'));
const PORT = process.env.PORT || 3000;

const wsServer = new WebSocket.Server({ server: httpServer });

// array of connected websocket clients
const connectedClients = [];

wsServer.on('connection', (ws, req) => {
  console.log('Connected');
  // add new connected client
  connectedClients.push(ws);
  // listen for messages from the streamer, the clients will not send anything so we don't need to filter
  ws.on('message', (data) => {
    // send the base64 encoded frame to each connected ws
    connectedClients.forEach((ws, i) => {
      if (ws.readyState === ws.OPEN) { // check if it is still connected
        ws.send(data); // send
      } else { // if it's not connected remove from the array of connected ws
        connectedClients.splice(i, 1);
      }
    });
  });
});

// HTTP stuff
app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './client.html')));
app.get('/streamer', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});
app.get('/notes', (req, res) => {
  console.log('notes get');
  pool.getConnection((err, con) => {
    if (err) throw err;
    const sql = 'SELECT * FROM sound_database.notes';
    con.query(sql, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.json(result);
      con.release();
    });
  });
});

app.get('/', (req, res) => {
  res.send(`
        <a href="streamer">Streamer</a><br>
        <a href="client">Client</a>
    `);
});

// con.connect((err) => {
//   if (err) throw err;
//   const sql = `SELECT * FROM sound_database.sound_db where tone = ${mysql.escape(test)}`;
//   con.query(sql, (err, result) => {
//     if (err) throw err;
//     const sql = `SELECT * FROM sound_database.sound_db where tone = ${mysql.escape(test)}`;
//     con.query(sql, (err, result) => {
//       if (err) throw err;
//       console.log(result);
//     });
//   });
// });

httpServer.listen(PORT, () => console.log(`HTTP server listening at http://localhost:${PORT}`));
