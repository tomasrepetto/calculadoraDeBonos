const express = require('express');
const app = express();
const path = require('path');

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

