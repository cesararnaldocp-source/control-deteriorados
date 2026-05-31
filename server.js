const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

// Configurar límites altos de carga para fotos en base64 de alta resolución
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir la carpeta actual (archivos estáticos)
app.use(express.static(__dirname));

// Endpoint profesional de OCR del lado del servidor (evita bloqueos CORS del navegador)
app.post('/api/ocr', async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: 'No se recibieron datos de la imagen' });
        }

        console.log("Iniciando transcripción OCR en el servidor...");

        // Preparar parámetros POST en formato application/x-www-form-urlencoded como recomienda ocr.space
        const params = new URLSearchParams();
        params.append('base64Image', image);
        params.append('language', 'spa');
        params.append('OCREngine', '2'); // Motor 2: Ideal para texto en pantalla LCD y tickets

        // Realizar la consulta a los servidores de ocr.space desde el backend (libre de CORS)
        const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: {
                'apikey': 'K87037568588957',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!ocrResponse.ok) {
            throw new Error(`Servidor de ocr.space respondió con código: ${ocrResponse.status}`);
        }

        const result = await ocrResponse.json();

        if (result && !result.IsErroredOnProcessing && result.ParsedResults && result.ParsedResults.length > 0) {
            const text = result.ParsedResults[0].ParsedText;
            console.log("Transcripción del servidor completada exitosamente.");
            res.json({ text });
        } else {
            const errMsg = result && result.ErrorMessage ? result.ErrorMessage.join(', ') : 'Error desconocido de OCR';
            console.warn("Fallo en procesamiento de OCR:", errMsg);
            res.status(500).json({ error: errMsg });
        }
    } catch (err) {
        console.error('Error en el servicio de OCR del servidor:', err);
        res.status(500).json({ error: err.message });
    }
});

// Responder con index.html para cualquier ruta no estática
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor de FarmaControl ejecutándose en el puerto ${PORT}`);
});
