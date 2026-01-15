import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'cndes.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Documents Table
        db.run(`CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            registrationDate TEXT,
            type TEXT,
            docNumber TEXT,
            docDate TEXT,
            origin TEXT,
            destination TEXT,
            summary TEXT,
            observations TEXT,
            status TEXT,
            fileName TEXT,
            attachments TEXT, 
            createdAt TEXT
        )`);

        // Users Table (Simple for now)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT,
            role TEXT,
            name TEXT
        )`, () => {
            // Seed default users if empty
            db.get("SELECT count(*) as count FROM users", (err, row) => {
                if (row.count === 0) {
                    const stmt = db.prepare("INSERT INTO users VALUES (?, ?, ?, ?)");
                    stmt.run("admin", "admin123", "Admin", "Administrador Sistema");
                    stmt.run("recep", "recep123", "Receptionist", "Recepcionista CNDES");
                    stmt.finalize();
                    console.log("Seeded default users.");
                }
            });
        });
    });
}

export default db;
