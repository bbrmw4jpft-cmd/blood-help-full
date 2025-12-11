const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const shortid = require('shortid');
const DB_PATH = path.join(__dirname, 'data', 'bloodconnect.db');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// helper to open DB
function openDb(){ return new sqlite3.Database(DB_PATH); }

app.get('/api/ping', (req,res)=> res.json({pong:true, ts: Date.now()}));

// get donors list with optional filters
app.get('/api/donors', (req,res)=>{
  const blood = req.query.blood || '';
  const pincode = req.query.pincode || '';
  const db = openDb();
  let sql = 'SELECT id,name,blood,pincode,lastDonatedDays,verified,phone FROM donors WHERE 1=1';
  const params = [];
  if(blood){ sql += ' AND blood = ?'; params.push(blood); }
  if(pincode){ sql += ' AND pincode = ?'; params.push(pincode); }
  sql += ' AND verified = 1 ORDER BY lastDonatedDays DESC LIMIT 200';
  db.all(sql, params, (err, rows)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json(rows);
  });
  db.close();
});

app.get('/api/donors/:id', (req,res)=>{
  const db = openDb();
  db.get('SELECT id,name,blood,pincode,lastDonatedDays,verified,phone FROM donors WHERE id = ?', [req.params.id], (err,row)=>{
    if(err) return res.status(500).json({error:err.message});
    if(!row) return res.status(404).json({error:'Not found'});
    res.json(row);
  });
  db.close();
});

// create emergency request
app.post('/api/requests', (req,res)=>{
  const {name, phone, pincode, blood} = req.body;
  if(!name || !phone || !pincode || !blood) return res.status(400).json({error:'missing fields'});
  const db = openDb();
  const id = shortid.generate();
  const eta = Math.floor(Math.random()*60)+20; // random ETA 20-80 mins
  const stmt = db.prepare('INSERT INTO requests(id,name,phone,pincode,blood,eta,created_at) VALUES(?,?,?,?,?,?,?)');
  stmt.run(id, name, phone, pincode, blood, eta, Date.now(), function(err){
    if(err) return res.status(500).json({error:err.message});
    db.get('SELECT COUNT(*) as cnt FROM requests', [], (e,row)=>{
      db.close();
      return res.json({success:true,requestId:id,eta, totalRequests: row ? row.cnt : null});
    });
  });
});


// get all requests (for admin)
app.get('/api/requests', (req,res)=>{
  const db = openDb();
  db.all('SELECT id,name,phone,pincode,blood,eta,created_at FROM requests ORDER BY created_at DESC LIMIT 200', [], (err, rows)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json(rows);
  });
  db.close();
});
// serve frontend if present

app.get('/', (req,res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Server running on port', PORT));
