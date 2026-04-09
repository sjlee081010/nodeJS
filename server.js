const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT
  )
  `);
});

// C
app.post('/posts', (req, res) => {
  const { title, content } = req.body;
  db.run(`INSERT INTO posts (title, content) VALUES (?, ?)`, [title, content], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// R
app.get('/posts', (req, res) => {
  db.all(`SELECT * FROM posts`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 수정 불러오기
app.get('/posts/:id', (req, res) => {
  db.get(`SELECT * FROM posts WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '없음' });
    res.json(row);
  });
});

// U
app.put('/posts/:id', (req, res) => {
  const { title, content } = req.body;
  db.run(`UPDATE posts SET title = ?, content = ? WHERE id = ?`, [title, content, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '없음' });
    res.json({ success: true });
  });
});

//D
app.delete('/posts/:id', (req, res) => {
  db.run(`DELETE FROM posts WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: '없음' });
    res.json({ success: true });
  });
});

app.listen(port, '0.0.0.0', () => console.log(`Server running at http://0.0.0.0:${port}`));