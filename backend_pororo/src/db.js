const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../data.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS thesis_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT DEFAULT '',
    filename TEXT NOT NULL,
    score INTEGER NOT NULL,
    innovation INTEGER NOT NULL,
    execution INTEGER NOT NULL,
    report INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

try {
  db.exec(`ALTER TABLE thesis_scores ADD COLUMN student_id TEXT DEFAULT ''`);
} catch (_) {}

module.exports = db;
