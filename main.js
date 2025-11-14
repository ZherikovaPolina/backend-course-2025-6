const { program } = require('commander');
const fs = require('fs');
const http = require('http');
const path = require('path');
const express = require('express');
const multer = require('multer');

program
  .requiredOption('-h, --host <host>', 'Server address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <dir>', 'Path to cache directory');

program.parse();
const options = program.opts();

const CACHE_DIR = path.resolve(process.cwd(), options.cache);
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const DB_FILE = path.join(CACHE_DIR, 'db.json');
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2));

const app = express();
const server = http.createServer(app); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(process.cwd(), 'public')));

const upload = multer({ storage: multer.memoryStorage() });

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || '[]');
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(db) {
  return db.length ? Math.max(...db.map(x => x.id)) + 1 : 1;
}

function photoFile(id) {
  return path.join(CACHE_DIR, `${id}.jpg`);
}

app.post('/register', upload.single('photo'), (req, res) => {
  const { inventory_name, description } = req.body;
  if (!inventory_name) return res.status(400).send("inventory_name is required");

  const db = readDB();
  const id = nextId(db);

  let photoName = null;
  if (req.file) {
    photoName = `${id}.jpg`;
    fs.writeFileSync(photoFile(id), req.file.buffer);
  }

  const item = { id, name: inventory_name, description: description || "", photo: photoName };
  db.push(item);
  writeDB(db);

  res.status(201).json(item);
});

app.get('/inventory', (req, res) => {
  const db = readDB();
  res.status(200).json(db);
});

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});

