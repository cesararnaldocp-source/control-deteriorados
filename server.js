const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Servir la carpeta actual
app.use(express.static(__dirname));

// Responder con index.html para cualquier ruta
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor de FarmaControl ejecutándose en el puerto ${PORT}`);
});
