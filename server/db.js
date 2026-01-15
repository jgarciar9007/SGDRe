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

        // Departments Table (Internal Areas from Image)
        db.run(`CREATE TABLE IF NOT EXISTS departments (
            name TEXT PRIMARY KEY
        )`, () => {
            db.get("SELECT count(*) as count FROM departments", (err, row) => {
                if (row.count === 0) {
                    const depts = [
                        'Pleno', 'Presidente', 'Vicepresidente 1 Bloque Social',
                        'Vicepresidente 2 Bloque Económico', 'Gabinete del Presidente', 'Consejería',
                        'Comisión Técnica Sector Laboral', 'Comisión Técnica Sector Social',
                        'Comisión Técnica Sector Cultural', 'Comisión Técnica Sector Económico',
                        'Comisión Técnica Sector Industrial', 'Comisión Técnica Sector Medioambiental',
                        'Secretaría General'
                    ];
                    const stmt = db.prepare("INSERT INTO departments VALUES (?)");
                    depts.forEach(d => stmt.run(d));
                    stmt.finalize();
                }
            });
        });

        // External Entities Table (Ministries and Public Companies of EG)
        db.run(`CREATE TABLE IF NOT EXISTS external_entities (
            name TEXT PRIMARY KEY
        )`, () => {
            db.get("SELECT count(*) as count FROM external_entities", (err, row) => {
                if (row.count === 0) {
                    const entities = [
                        // Ministerios
                        'Presidencia de la República',
                        'Vicepresidencia de la República',
                        'Primer Ministro del Gobierno',
                        'Ministerio de Asuntos Exteriores y Cooperación Internacional',
                        'Ministerio de Justicia, Culto e Instituciones Penitenciarias',
                        'Ministerio de Defensa Nacional',
                        'Ministerio del Interior y Corporaciones Locales',
                        'Ministerio de Seguridad Nacional',
                        'Ministerio de Hacienda y Presupuestos',
                        'Ministerio de Economía, Planificación e Inversiones Públicas',
                        'Ministerio de Educación, Ciencias, Artes y Deportes',
                        'Ministerio de Sanidad y Bienestar Social',
                        'Ministerio de Obras Públicas, Viviendas y Urbanismo',
                        'Ministerio de Trabajo, Fomento de Empleo y Seguridad Social',
                        'Ministerio de Agricultura, Ganadería y Desarrollo Rural',
                        'Ministerio de Pesca y Recursos Hídricos',
                        'Ministerio de Minas e Hidrocarburos',
                        'Ministerio de Electricidad y Energías Renovables',
                        'Ministerio de Comercio y Promoción de Pequeñas y Medianas Empresas',
                        'Ministerio de Información, Prensa y Radio',
                        'Ministerio de Cultura, Turismo y Promoción Artesanal',
                        'Ministerio de Asuntos Sociales e Igualdad de Género',
                        'Ministerio de la Función Pública y Reforma Administrativa',
                        'Ministerio de Transportes, Telecomunicaciones y Sistemas de Inteligencia Artificial',
                        'Ministerio de Aviación Civil e Infraestructuras Aeroportuarias',
                        'Ministerio de Juventud y Deportes',
                        // Empresas Públicas y Entidades
                        'GETESA', 'SEGESA', 'GECOTEL', 'GITGE', 'Ceiba Intercontinental',
                        'SONAGAS', 'GEPetrol', 'GEPetrol Seguros', 'GEPetrol Servicios',
                        'SONAPESCA', 'GAE', 'GEPROYECTOS', 'HOLDING Guinea Ecuatorial',
                        'INSESO', 'CENTRAMED', 'ITV', 'ORTEL', 'GECOMSA',
                        'Clínica de Fertilidad de Oyala', 'Hospital La Paz', 'IMPGE', 'EMPYGE', 'IMPYDE'
                    ];
                    const stmt = db.prepare("INSERT INTO external_entities VALUES (?)");
                    entities.forEach(e => stmt.run(e));
                    stmt.finalize();
                }
            });
        });

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
