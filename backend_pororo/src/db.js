const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../data.sqlite"));

db.exec(`
  CREATE TABLE IF NOT EXISTS thesis_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    score INTEGER NOT NULL,
    innovation INTEGER NOT NULL,
    execution INTEGER NOT NULL,
    report INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
