// Install required packages using: npm install express socket.io sqlite3
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const DATABASE = 'answers.db';

// Initialize database
const initDb = () => {
  const db = new sqlite3.Database(DATABASE);
  db.run(`CREATE TABLE IF NOT EXISTS answers (id INTEGER PRIMARY KEY, username TEXT, answer TEXT)`);
  db.close();
};

initDb();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', (req, res) => {
  const { username, answer } = req.body;

  // Store answer in database
  const db = new sqlite3.Database(DATABASE);
  db.run('INSERT INTO answers (username, answer) VALUES (?, ?)', [username, answer], function(err) {
    if (err) {
      return console.error(err.message);
    }
    // Notify all clients of the new answer
    io.emit('new_answer', { username, answer });
  });
  db.close();

  res.redirect('/');
});

io.on('connection', (socket) => {
  // Send all previous answers to the newly connected client
  const db = new sqlite3.Database(DATABASE);
  db.all('SELECT username, answer FROM answers', [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    rows.forEach((row) => {
      socket.emit('new_answer', { username: row.username, answer: row.answer });
    });
  });
  db.close();
});

server.listen(() => {
  console.log('Server is running');
});
