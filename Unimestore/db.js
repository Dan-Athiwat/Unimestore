// db.js
// SQLite initialization and helpers

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS apps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      desktop_version TEXT,
      mobile_version TEXT,
      desktop_file_path TEXT,
      mobile_file_path TEXT,
      profile_path TEXT,
      created_at TEXT NOT NULL
    )
  `);
});

module.exports = db;