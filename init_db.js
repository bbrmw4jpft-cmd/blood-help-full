const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname,'data');
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const DB_PATH = path.join(dataDir,'bloodconnect.db');

const db = new sqlite3.Database(DB_PATH);
db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    blood TEXT,
    pincode TEXT,
    lastDonatedDays INTEGER,
    verified INTEGER,
    phone TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    pincode TEXT,
    blood TEXT,
    eta INTEGER,
    created_at INTEGER
  )`);
  // insert sample donors
  const donors = [
    ['Ravi Kumar','A+','474001',120,1,'+91-9000000001'],
    ['Sana Patel','O+','474001',60,1,'+91-9000000002'],
    ['Aman Singh','B+','474002',200,0,'+91-9000000003'],
    ['Priya Sharma','A+','474003',40,1,'+91-9000000004'],
    ['Deepak Joshi','AB+','474001',90,1,'+91-9000000005'],
    ['Neha Verma','O-','474002',120,1,'+91-9000000006'],
    ['Karan Mehta','B-','474003',75,1,'+91-9000000007'],
    ['Meena Gupta','A-','474001',45,1,'+91-9000000008'],
    ['Suresh R','O+','474004',30,1,'+91-9000000009'],
    ['Anjali K','AB-','474002',150,1,'+91-9000000010']
  ];
  const stmt = db.prepare('INSERT INTO donors(name,blood,pincode,lastDonatedDays,verified,phone) VALUES(?,?,?,?,?,?)');
  donors.forEach(d => stmt.run(...d));
  stmt.finalize();
  console.log('Database initialized with sample donors.');
});
db.close();
