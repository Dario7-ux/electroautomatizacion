const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'electromecanica.json');
const ROOT_DIR = path.join(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const INDEX_ASSETS_DIR = path.join(ROOT_DIR, 'index_files');

app.use(express.json());
app.use(express.static(FRONTEND_DIR, { index: false }));

app.get(['/frontend', '/frontend/'], (_req, res) => {
  res.redirect('/index.html');
});

app.get('/frontend/:page.html', (_req, res) => {
  res.redirect('/index.html');
});

app.use('/frontend', express.static(FRONTEND_DIR, { index: false }));
app.use('/index_files', express.static(INDEX_ASSETS_DIR, { index: false }));

async function readData() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/api/info', async (_req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'No se pudo leer la información.' });
  }
});

app.get('/api/servicios', async (_req, res) => {
  try {
    const data = await readData();
    res.json(data.servicios);
  } catch (error) {
    res.status(500).json({ error: 'No se pudieron obtener los servicios.' });
  }
});

app.post('/api/servicios', async (req, res) => {
  const { nombre, descripcion, categoria } = req.body;

  if (!nombre || !descripcion || !categoria) {
    return res.status(400).json({
      error: 'Los campos nombre, descripcion y categoria son obligatorios.'
    });
  }

  try {
    const data = await readData();
    const newService = {
      id: randomUUID(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      categoria: categoria.trim()
    };

    data.servicios.push(newService);
    await writeData(data);

    return res.status(201).json(newService);
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo guardar el servicio.' });
  }
});

app.get('/', (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});