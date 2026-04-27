require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// log
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// UMA pasta pública (igual antes)
app.use(express.static(path.join(__dirname, 'src/public')));

// API (não interfere no frontend)
const produtoRoutes = require('./src/routes/produtosRoutes');
app.use('/produtos', produtoRoutes);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});